import Vue from 'vue'
import { Platform } from 'quasar'
import router from '@/base/router'
import datastore from '@/base/datastore'
import axios from '@/base/api/axios'
import { debounceAndFlushBeforeUnload } from '@/utils/utils'

const SAVE_INTERVAL_MS = 5000 // batch saves to the backend

const performance = window.performance

// Make sure we have all the required performance methods
// and that vue's performance mode is not enabled (don't want to fight it)
const ENABLED = performance &&
  performance.clearMeasures &&
  performance.clearMarks &&
  performance.measure &&
  performance.mark &&
  !Vue.config.performance

// For each load we measure up to the point where the first v-measure is measured
// the set done to true so we don't record beyond that, until the next page load
let done = false

// The first load is the main page load from the server, after that we record the page
// loads within the browser
let firstLoad = true

// When using performance.measure() we don't use a start mark initially, which causes it to
// measure from the start of that whole page load, subsequent javascript page loads are only
// measured from when we create the mark in router beforeEach()
let startMark

// What we will eventually save for this measurement run
// Keeping it up here so its possible to add things to it as we go along...
// ... well basically the firstLoad flag
let currentStat = {}

function initialize () {
  startMark = 'karrot-start'
  done = false
  currentStat = {}
  performance.clearMarks()
  performance.clearMeasures()
  performance.mark(startMark)
}

if (ENABLED) {
  router.beforeEach((to, from, next) => {
    if (firstLoad) {
      firstLoad = false
      currentStat.firstLoad = true
    }
    else {
      initialize()
      currentStat.firstLoad = false
    }
    next()
  })

  Vue.directive('measure', {
    inserted () {
      if (done) return
      measure('MM') // MM = "Meaningful Mount" inspired by FMP (First Meaningful Paint)
      done = true
      finish()
    },
  })
}
else {
  // measurement is not enabled
  // we create an empty directive so we don't have invalid use of v-measure directives in the rest of the code
  Vue.directive('measure', {})
}

const pendingStats = []
const save = debounceAndFlushBeforeUnload(() => {
  const stats = [...pendingStats]
  pendingStats.length = 0
  axios.post('/api/stats/', { stats })
}, SAVE_INTERVAL_MS, { maxWait: SAVE_INTERVAL_MS * 2 })

function finish () {
  const firstMeaningfulMount = performance.getEntriesByName('karrot MM')[0]
  if (!firstMeaningfulMount) return
  pendingStats.push({
    ...currentStat,
    ms: firstMeaningfulMount && firstMeaningfulMount.duration,
    loggedIn: datastore.getters['auth/isLoggedIn'],
    group: datastore.getters['currentGroup/id'],
    routeName: router.currentRoute.name,
    routePath: router.currentRoute.fullPath,
    routeParams: router.currentRoute.params,
    mobile: Boolean(Platform.is.mobile),
  })
  save()
}

function measure (name, qualifier) {
  if (!ENABLED || done) return
  const label = ['karrot', name, qualifier].join(' ').trim()
  if (startMark) {
    performance.measure(label, startMark)
  }
  else {
    performance.measure(label)
  }
}
