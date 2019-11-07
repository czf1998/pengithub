import React, {Component} from 'react'
import {connect} from 'react-redux'
import {View, Text, FlatList, Dimensions} from 'react-native'
import {createAsyncAction_getFilesData} from "../../../../../redux/module/repositoryDetail/action";
import {LoadingView, SlideInTransition} from "../../../../../component";
import FileListItem from "./FileListItem";

class FilesTopTabItemScreen extends Component{

    componentDidMount(): void {
        this._getData()
    }

    _getData = () => {
        this.props.dispatch_getFilesData(this.props.repositoryModel)
    }

    _renderItem = (itemData) => {
        return <SlideInTransition>
                <FileListItem file={itemData.item} index={itemData.index}/>
        </SlideInTransition>
    }

    render() {
        const {repositoryDetailStore} = this.props
        const {contents,branches,releases} = repositoryDetailStore
        const {loading,data} = contents
        return (
            <View style={{flex:1}}>
                <LoadingView indicatorSize={30}
                             color="black"
                             loading={loading}
                             style={{flex:1}}>
                    <FlatList data={data}
                             keyExtractor={item => "" + item.sha}
                             renderItem={itemData => this._renderItem(itemData)}
                             style={{width:Dimensions.get('window').width}}/>
                </LoadingView>
            </View>
        )
    }
}

const mapState = state => ({
    repositoryDetailStore: state.repositoryDetail
})

const mapActions = dispatch => ({
    dispatch_getFilesData: (repositoryModel) => {
        dispatch(createAsyncAction_getFilesData({},{
            owner: repositoryModel.owner,
            repo: repositoryModel.repo,
            path: ''
        }))
    }
})
export default connect(mapState,mapActions)(FilesTopTabItemScreen)
