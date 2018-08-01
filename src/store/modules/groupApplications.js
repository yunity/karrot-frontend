import Vue from 'vue'
import groupApplications from '@/services/api/groupApplications'
import router from '@/router'
import { indexById, withMeta, createMetaModule, metaStatuses } from '@/store/helpers'

function initialState () {
  return {
    entries: {},
  }
}
export default {
  namespaced: true,
  modules: { meta: createMetaModule() },
  state: initialState(),
  getters: {
    get: (state, getters, rootState, rootGetters) => applicationId => {
      return getters.enrich(state.entries[applicationId])
    },
    enrich: (state, getters, rootState, rootGetters) => application => {
      return application && {
        ...application,
        applicant: rootGetters['users/get'](application.user),
        isPending: application.status === 'pending',
        isDeclined: application.status === 'declined',
        isAccepted: application.status === 'accepted',
        isWithdrawn: application.status === 'withdrawn',
      }
    },
    getByGroupId: state => groupId => {
      return Object.values(state.entries).find(a => a.group === groupId)
    },
    allPending: (state, getters) => Object.keys(state.entries).map(getters.get).filter(a => a.isPending),
    allNonPending: (state, getters) => Object.keys(state.entries).map(getters.get).filter(a => !a.isPending),
    ...metaStatuses(['apply']),
  },
  actions: {
    ...withMeta({

      async fetchMine ({ commit, rootGetters }) {
        const userId = rootGetters['auth/userId']
        const applicationList = await groupApplications.list({ user: userId, status: 'pending' })
        commit('set', applicationList)
      },

      async fetchByGroupId ({ commit, getters }, { groupId }) {
        const applicationList = await groupApplications.list({ group: groupId })
        commit('set', applicationList)
        const all = getters.allPending
        console.log('give me that array!', all)
      },

      async apply ({commit, dispatch}, data) {
        const newApplication = await groupApplications.create(data)
        commit('update', newApplication)
        dispatch('toasts/show', {
          message: 'JOINGROUP.APPLICATION_SUBMITTED',
        }, { root: true })
        router.push({ name: 'groupPreview', params: { groupPreviewId: data.group } })
      },

      async withdraw ({ commit, dispatch }, applicationId) {
        const removedApplication = await groupApplications.withdraw(applicationId)
        commit('delete', removedApplication.id)
        dispatch('toasts/show', {
          message: 'JOINGROUP.APPLICATION_WITHDRAWN',
        }, { root: true })
      },

      async accept ({commit, dispatch}, data) {
        const acceptedApplication = await groupApplications.accept(data)
        commit('update', acceptedApplication)
        dispatch('toasts/show', {
          message: 'APPLICATION.ACCEPTED',
        }, { root: true })
      },

      async decline ({ commit, dispatch }, data) {
        console.log('Tell me watcha got! ' + data)
        const declinedApplication = await groupApplications.decline(data)
        commit('update', declinedApplication)
        dispatch('toasts/show', {
          message: 'APPLICATION.DECLINED',
        }, { root: true })
      },

    }),
    clearGroupPreviewAndStatus ({ dispatch }) {
      dispatch('meta/clear', ['apply'])
      dispatch('groups/clearGroupPreview', null, { root: true })
    },
  },
  mutations: {
    set (state, applicationList) {
      state.entries = indexById(applicationList)
    },
    delete (state, id) {
      if (state.entries[id]) Vue.delete(state.entries, id)
    },
    update (state, application) {
      Vue.set(state.entries, application.id, application)
    },
  },
}
