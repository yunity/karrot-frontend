import axios from '@/services/axios'

export default {
  async create (data) {
    return (await axios.post('/api/group-applications/', data)).data
  },

  // async get (data) {
  //   return (await axios.get('/api/group-applications/{id}/', data)).data
  // },

  async list (filter) {
    return (await axios.get('/api/group-applications/', { params: filter })).data
  },

  async accept (applicationId) {
    console.log('In the service: ' + applicationId)
    return (await axios.post(`/api/group-applications/${applicationId}/accept/`)).data
  },

  // async decline (data) {
  //   return (await axios.post('/api/group-applications/{id}/decline', data)).data
  // },

  async withdraw (applicationId) {
    return (await axios.post(`/api/group-applications/${applicationId}/withdraw/`)).data
  },
}