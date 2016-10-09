// MapActions
export const CHANGED_MAP_CENTER = 'CHANGED_MAP_CENTER'
export const SET_ACTIVE_MARKERS = 'SET_ACTIVE_MARKERS'
export const SET_ZOOM = 'SET_ZOOM'
export const ADDED_NEW_QUAY = 'ADDED_NEW_QUAY'
export const REMOVED_QUAY = 'REMOVED_QUAY'
export const CHANGED_QUAY_NAME = 'CHANGED_QUAY_NAME'
export const CHANGED_QUAY_DESCRIPTION = 'CHANGED_QUAY_DESCRIPTION'
export const CHANGED_QUAY_TYPE = 'CHANGED_QUAY_TYPE'
export const CHANGED_QUAY_POSITION = 'CHANGED_QUAY_POSITION'
export const CHANGED_WHA = 'CHANGED_WHA' // i.e. wheelchairAccessability
export const CHANGED_STOP_NAME = 'CHANGED_STOP_NAME'
export const CREATE_NEW_STOP = 'CREATE_NEW_STOP'
export const DESTROYED_NEW_STOP = 'DESTROYED_NEW_STOP'
export const CHANGED_STOP_DESCRIPTION = 'CHANGED_STOP_DESCRIPTION'
export const CHANGED_STOP_TYPE = 'CHANGED_STOP_TYPE'

// AjaxActions
export const RECEIVED_DATASOURCE = 'RECEIVED_DATASOURCE'

export const REQUESTED_STOP_NAMES = 'REQUESTED_STOP_NAMES'
export const RECEIVED_STOP_NAMES = 'RECEIVED_STOP_NAMES'
export const ERROR_STOP_NAMES = 'ERROR_STOP_NAMES'

export const REQUESTED_STOP = 'REQUESTED_STOP'
export const RECEIVED_STOP = 'RECEIVED_STOP'
export const ERROR_STOP = 'ERROR_STOP'

export const SUCCESS_STOP_SAVED = 'SUCCESS_STOP_SAVED'
export const ERROR_STOP_SAVED = 'ERROR_STOP_SAVED'

export const RECEIVED_STOPS_NEARBY = 'RECEIVED_STOPS_NEARBY'
export const ERROR_STOPS_NEARBY = 'ERROR_STOPS_NEARBY'

// UserActions
export const NAVIGATE_TO = 'NAVIGATE_TO'
export const TOGGLED_IS_CREATING_NEW_STOP = 'TOGGLED_IS_CREATING_NEW_STOP'
export const APPLIED_STOPTYPE_SEARCH_FILTER = 'APPLIED_STOPTYPE_SEARCH_FILTER'
export const OPENED_SNACKBAR = 'OPENED_SNACKBAR'
export const DISMISSED_SNACKBAR = 'DISMISSED_SNACKBAR'
export const CHANGED_LOCALIZATION = 'CHANGED_LOCALIZATION'
export const APPLIED_LOCALE = 'APPLIED_LOCALE'
export const GET_TOPOGRAPHICAL_PLACES = 'GET_TOPOGRAPHICAL_PLACES'
export const ADDED_TOPOS_CHIP = 'ADDED_TOPOS_CHIP'
export const DELETED_TOPOS_CHIP = 'DELETED_TOPOS_CHIP'

//Snackbar types
export const SNACKBAR_MESSAGE_SAVED = 'snackbar_message_saved'
export const SNACKBAR_MESSAGE_FAILED = 'snackbar_message_failed'
