import activityTypes from '@/activities/api/activityTypes'
import { indexById } from '@/utils/datastore/helpers'
import i18n from '@/base/i18n'

function initialState () {
  return {
    entries: {},
  }
}

export default {
  namespaced: true,
  state: initialState(),
  getters: {
    get: (state, getters) => activityTypeId => {
      return getters.enrich(state.entries[activityTypeId])
    },
    all: (state, getters) => Object.values(state.entries).map(getters.enrich),
    enrich: state => activityType => {
      if (!activityType) return
      const { id, icon, name, nameIsTranslatable } = activityType
      // this corresponds to the name used by the activity type stylesheet plugin
      const colorName = `activity-type-${id}`
      const maybeTranslatedName = nameIsTranslatable ? i18n.t(`ACTIVITY_TYPE_NAMES.${name}`) : name
      return {
        ...activityType,
        colorName,
        iconProps: {
          name: icon,
          color: colorName,
          title: maybeTranslatedName,
        },
        name: maybeTranslatedName,
      }
    },
    byCurrentGroup: (state, getters, rootState, rootGetters) => {
      return getters.all.filter(({ group }) => group === rootGetters['currentGroup/id'])
    },
  },
  actions: {
    async fetch ({ commit }) {
      commit('update', await activityTypes.list())
    },
  },
  mutations: {
    clear (state) {
      Object.assign(state, initialState())
    },
    update (state, activityTypes) {
      state.entries = Object.freeze({ ...state.entries, ...indexById(activityTypes) })
    },
  },
}

export function plugin (datastore) {
  datastore.watch((state, getters) => getters['auth/isLoggedIn'], isLoggedIn => {
    if (isLoggedIn) {
      datastore.dispatch('activityTypes/fetch')
    }
    else {
      datastore.dispatch('activityTypes/clear')
    }
  })
}
