import {CommonAction,CommonActionId} from "../commonActionType";
import DataStore from "../../../dao/DataStore";
import {URL_REPOSITORY_CONTRIBUTORS,
        URL_REPOSITORY_INFO,
        URL_REPOSITORY_README} from '../urlConstant';
import {CommonExceptionHandler} from "../CommonExceptionHandler";
var parse = require('parse-link-header');

let getRepositoryInfoDataController = new AbortController()
let getContributorsCountController = new AbortController()
let getReadmeController = new AbortController()
let getRepositoryInfoDataSignal = getRepositoryInfoDataController.signal
let getContributorsCountSignal = getContributorsCountController.signal
let getReadmeSignal = getReadmeController.signal


export const createSyncAction_getRepositoryInfoData = (option,meta) => {
    const url = URL_REPOSITORY_INFO(meta.owner, meta.repo)
    const contributorsUrl = URL_REPOSITORY_CONTRIBUTORS(meta.owner, meta.repo,{per_page:1})
    const readmeUrl = URL_REPOSITORY_README(meta.owner, meta.repo)

    return dispatch => {

        dispatch({
            type: CommonAction.TRIGGER_LOADING,
            payload: {
                id: CommonActionId.GET_REPOSITORY_INFO_DATA,
                loading: true
            }
        })

        dispatch({
            type: CommonAction.TRIGGER_LOADING,
            payload: {
                id: CommonActionId.GET_CONTRIBUTORS_COUNT,
                loading: true
            }
        })

        dispatch({
            type: CommonAction.TRIGGER_LOADING,
            payload: {
                id: CommonActionId.GET_REPOSITORY_README,
                loading: true
            }
        })

        //getRepositoryInfoDataController.abort()
        DataStore.fetchData(url,{...option,fetchOption:{signal:getRepositoryInfoDataSignal}}).then(wrappedData => {
            if(wrappedData.data) {
                dispatch({
                    type: CommonAction.GET_DATA_SUCCESS,
                    payload: {
                        id: CommonActionId.GET_REPOSITORY_INFO_DATA,
                        data: wrappedData.data
                    }
                })
            } else {
                dispatch({
                    type: CommonAction.GET_DATA_FAIL,
                    payload: {
                        id: CommonActionId.GET_REPOSITORY_INFO_DATA,
                    }
                })
            }
        }).catch(e => {
            CommonExceptionHandler(e,dispatch,CommonActionId.GET_REPOSITORY_INFO_DATA)
        })

        //getContributorsCountController.abort()
        DataStore.fetchData(contributorsUrl,{...option,fetchOption:{signal:getContributorsCountSignal}}).then(wrappedData => {
            if(wrappedData.data) {
                if(!wrappedData.headers.link) {
                    dispatch({
                        type: CommonAction.GET_DATA_SUCCESS,
                        payload: {
                            id: CommonActionId.GET_CONTRIBUTORS_COUNT,
                            data: 1
                        }
                    })
                    return
                }
                let parsed = parse(wrappedData.headers.link);
                if(!parsed.last.page) {
                    throw new Error("parse headers link fail")
                }
                dispatch({
                    type: CommonAction.GET_DATA_SUCCESS,
                    payload: {
                        id: CommonActionId.GET_CONTRIBUTORS_COUNT,
                        data: parsed.last.page
                    }
                })
            } else {
                dispatch({
                    type: CommonAction.GET_DATA_FAIL,
                    payload: {
                        id: CommonActionId.GET_CONTRIBUTORS_COUNT,
                    }
                })
            }
        }).catch(e => {
            CommonExceptionHandler(e,dispatch,CommonActionId.GET_CONTRIBUTORS_COUNT)
        })

        //getReadmeController.abort()
        DataStore.fetchData(readmeUrl,{...option,refresh:true,fetchOption:{signal:getReadmeSignal,headers:{Accept:"application/vnd.github.VERSION.html"}}}).then(wrappedData => {
            if(wrappedData.data) {
                dispatch({
                    type: CommonAction.GET_DATA_SUCCESS,
                    payload: {
                        id: CommonActionId.GET_REPOSITORY_README,
                        data: wrappedData.data
                    }
                })
            } else {
                dispatch({
                    type: CommonAction.GET_DATA_FAIL,
                    payload: {
                        id: CommonActionId.GET_REPOSITORY_README,
                    }
                })
            }
        }).catch(e => {
            CommonExceptionHandler(e,dispatch,CommonActionId.GET_REPOSITORY_README)
        })
    }
}
