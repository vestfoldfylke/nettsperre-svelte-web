import axios from 'axios'
import { getMsalClient, login } from './auth/msal-auth'
import { jwtDecode } from 'jwt-decode'

/**
 * 
 * @param {boolean} decoded | If the token should be decoded or not
 * @returns | The access token for the user
 */
export const getNettsperreToken = async (decoded) => {
  // MOCK access token for local api (the access token is just a demo token - nothing dangerous)
  // if (import.meta.env.VITE_MOCK_MSAL === 'true') return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhcGk6Ly9ibGFibGFiIiwiaXNzIjoiaHR0cHM6Ly9kdXN0LmR1c3Rlc2VuLnZ0ZmsubmV0L2hhaGFoLyIsImlhdCI6MTcwNjM2MDM5MiwibmJmIjoxNzA2MzYwMzkyLCJleHAiOjE3MDYzNjU4MjAsImFjciI6IjEiLCJhaW8iOiJiYWJhYmFiYWIiLCJhbXIiOlsicnNhIiwibWZhIl0sInJvbGVzIjpbImR1c3RfYWNjZXNzIiwiYWRtaW5fYWNjZXNzIl0sImFwcGlkIjoiZ3VkZW5lIHZlaXQiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IlNww7hrZWxzZSIsImdpdmVuX25hbWUiOiJEZW1vIiwiaXBhZGRyIjoiMjAwMToyMDIwOjQzNDE6ZmNiYjoyOTU5OjFjNmE6Y2RhYjoyNGUwIiwibmFtZSI6IkRlbW8gU3DDuGtlbHNlIiwib2lkIjoiMTIzNDUiLCJvbnByZW1fc2lkIjoiU1VTVVNVUyIsInJoIjoic2kgc2Vub3IiLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJtYXJpbmUiLCJ0aWQiOiJza2xlbW1lIiwidW5pcXVlX25hbWUiOiJkZW1vLnNwb2tlbHNlQHZlc3Rmb2xkZnlsa2Uubm8iLCJ1cG4iOiJkZW1vLnNwb2tlbHNlQHZlc3Rmb2xkZnlsa2Uubm8iLCJ1dGkiOiJob2hvbyIsInZlciI6IjEuMCJ9.64xzW92dVIXpZ_2OXQ6KQHITtYByDZJn1ycX3p_EkW4'
  let accessToken
  if(!decoded) {
    decoded = false
  }
  try {
    const msalClient = await getMsalClient()
    if (!msalClient.getActiveAccount()) {
      console.log('Ingen aktiv bruker her enda - venter på ferdig pålogging før vi gjør API spørringer')
      throw new Error('User not logged in yet - waiting for successful login')
    }
    accessToken = (await msalClient.acquireTokenSilent({ scopes: [import.meta.env.VITE_DEFAULT_SCOPE] })).accessToken
    if(decoded) {
      // Return the decoded token
      const result = {
        upn: '',
        name: '',
        oid: '',
        roles: []
      }
      let decodedToken = jwtDecode(accessToken)
      const { upn, roles, name, oid} = decodedToken
      result.upn = upn || 'appReg'
      result.roles = roles || []
      result.name = name || 'appReg'
      result.oid = oid || 'appReg'

      return result
    }
    return accessToken
  } catch (error) {
    // EN CASE HER ER AT BRUKER har tilgang på frontend men ikke api (app registrering)
    if (error.toString().startsWith('Error: User not logged in yet')) { // Liten frekkas - om bruker ikke er logget inn, kast en error og vent på "vellykket" (hva slags ord skal brukes her egt???) login
      throw error
    }
    // If acquireTokenSilent failed and user is (on the paper/session storage) logged in - we assume the user has been logged out or the refresh token has expired - simply log in again :)
    await login(true) // Sends the user back to main-page, so the search will have to be done again (this should not happen often)
  }
}
/**
 * 
 * @param {*} upn | The upn of the user to get classes for
 * @returns 
 */
export const getClasses = async (upn) => { 
  const token = await getNettsperreToken()
  const response = await axios.get(import.meta.env.VITE_NETTSPERRE_API_URL + `/getOwnedGroups/${upn}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response
}

/**
 * 
 * @param {*} classId | The classId to get students from
 * @returns 
 */
export const getStudents = async (classId) => {
  const token = await getNettsperreToken()
  const response = await axios.get(import.meta.env.VITE_NETTSPERRE_API_URL + `/getGroupMembers/${classId}/${import.meta.env.VITE_RETURN_ONLY_STUDENTS}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response
}

/**
 * 
 * @returns | The group members of the search group
 */
export const getGroupMembers = async () => {
  const token = await getNettsperreToken()
  const response = await axios.get(import.meta.env.VITE_NETTSPERRE_API_URL + `/getGroupMembers/${import.meta.env.VITE_SEARCH_GROUP}/false`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response
}

/**
 * 
 * @param {Object} block | The block to be created
 * @returns 
 */
export const postBlock = async (block) => { 
  const token = await getNettsperreToken()
  try {
    const response = await axios.post(import.meta.env.VITE_NETTSPERRE_API_URL + '/submitBlock', block, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if(response.status !== 201) {
      return { error: response.data }
    }
    return response
  } catch (error) {
    return error
  }
}

/**
 * 
 * @param {Object} block | The block to be updated
 * @returns 
 */
export const putBlock = async (block) => {
  const token = await getNettsperreToken()
  try {
    const response = await axios.put(import.meta.env.VITE_NETTSPERRE_API_URL + '/updateBlock', block, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if(response.status !== 200) {
      return { error: response.data }
    }
    return response
  } catch (error) {
    return error
  }
}

/**
 * 
 * @param {String} status | Comma separated string of statuses
 * @param {String} upn | The upn of the user to get blocks for
 */
export const getBlocks = async (status, upn) => {
  const token = await getNettsperreToken()
  // Check if the upn is provided
  if(!upn) return { error: 'No upn provided' }

  const validStatus = ['pending', 'active', 'expired']
  // Check if the status is a comma separated list
  if(status.includes(',')) {
    const statusToArray = status.split(',')
    // Check if all the statuses are valid
    statusToArray.forEach(status => {
      if(!validStatus.includes(status)) {
        return { error: 'Invalid status' }
      }
    })
    
  } else {
    // If the status is not valid, return an error
    if(!validStatus.includes(status)) {
      return { error: 'Invalid status' }
    }
  }
  
  const response = await axios.get(import.meta.env.VITE_NETTSPERRE_API_URL + `/getBlocks/${status}/${upn}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response
}

/**
 * 
 * @param {Object} block | The block to be deleted
 * @param {String} action | The action to be performed on the block
 * @returns 
 */
export const deleteBlock = async (block, action) => {
  const token = await getNettsperreToken()
  try {
    const response = await axios.post(import.meta.env.VITE_NETTSPERRE_API_URL + `/deleteBlock/${block._id}/${action}`, block, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if(response.status !== 200) {
      return { error: response.data }
    }
    return response
  } catch (error) {
    return error
  }
}
/**
 * 
 * @param {String} requestor | The UPN of the user requesting permission
 * @param {String} teacher | The UPN of the teacher to be edited
 * @returns 
 */
export const validatePermission = async (requestor, teacher) => {
  // Check if the requestor and teacher is provided
  if(!requestor || !teacher) return { error: 'No requestor or teacher provided' }
  const token = await getNettsperreToken()
  try {
    const response = await axios.post(import.meta.env.VITE_NETTSPERRE_API_URL + '/validatePermission', { requestorUPN: requestor, teacherToBeEditedUPN: teacher }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response
  } catch (error) {
    return error
  }
}

export const getExtendedUserInfo = async (upn) => {
  // Check if the upn is provided
  if(!upn) return { error: 'No upn provided' }
  const token = await getNettsperreToken()
  try {
    const response = await axios.get(import.meta.env.VITE_NETTSPERRE_API_URL + `/extendedUserInfo/${upn}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response
  } catch (error) {
    return error
  }
}


/**
 * Retrieves history based on teacher, course, and school parameters.
 * At least one parameter must be provided; otherwise, an error is returned.
 *
 * @async
 * @function getHistory
 * @param {string} [teacher] - The teacher's identifier. Example: 'teacher@county.no'.
 * @param {string} [course] - The course's identifier. Example: 'POV-MAT101-Klasse'.
 * @param {string} [school] - The school's identifier. Example: Porsgrunn videregående skole.
 * @returns {Promise<Object>} The response from the API or an error object.
 */
export const getHistory = async (teacher, course, school) => {
  const token = await getNettsperreToken()
  // Check if any of the parameters are provided
  if(!teacher && !course && !school) return { error: 'No parameters provided' }

  let query = ''
  // Build the query string
  teacher ? query += `${teacher}/` : query += 'null/'
  course ? query += `${course}/` : query += 'null/'
  school ? query += `${school}` : query += 'null'
  try {
    const response = await axios.get(import.meta.env.VITE_NETTSPERRE_API_URL + `/history/${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response
  } catch (error) {
    return error
  }
}
