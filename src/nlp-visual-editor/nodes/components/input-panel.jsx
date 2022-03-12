import React from 'react';
import {
  Button,
  FileUploader,
  FileUploaderItem,
} from 'carbon-components-react';
import RHSPanelButtons from '../../components/rhs-panel-buttons';
import { connect } from 'react-redux';
import axios from 'axios';
import './input-panel.scss';

import {
  saveNlpNode,
  setShowRightPanel,
  setTabularResults,
} from '../../../redux/slice';

class InputPanel extends React.Component {
  constructor(props) {
    super(props);
    const { files } = props;
    this.state = { files };
  }

  onFileRemoved = (fileName, evt) => {
    const { files } = this.state;
    const { nodeId } = this.props;
    const newFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { name } = file;
      if (name != fileName) {
        newFiles.push(file);
      }
    }
    this.setState({ files: newFiles });
    //hides the bottom panel
    this.props.setTabularResults(undefined);
    this.props.saveNlpNode({
      node: { nodeId, files: newFiles, isValid: false },
    });
  };

  onFilesSelected = (e) => {
    const { files } = e.target;
    this.setState({ files });
  };

  onUploadFiles = async (e) => {
    const { workingId } = this.props;
    e.preventDefault();
    const formData = new FormData();
    const { files } = this.state;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      formData.append('attach_file', file);
    }
    formData.append('workingId', workingId);
    try {
      const res = await axios.post('/api/upload', formData);
      this.saveParameters();
    } catch (ex) {
      //TODO handle error
      console.log(ex);
    }
  };

  getFileNames = () => {
    const fileNames = [];
    const { files } = this.state;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { name } = file;
      fileNames.push(name);
    }
    return fileNames;
  };

  getFileUploadList = () => {
    const fileItems = [];
    const { files } = this.state;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { name } = file;
      fileItems.push(
        <FileUploaderItem
          onDelete={this.onFileRemoved.bind(this, name)}
          size={'sm'}
          status={'edit'}
          name={name}
          key={name}
        />,
      );
    }

    return fileItems;
  };

  validateParameters = () => {
    const { files } = this.state;

    const errorMessage =
      files.length === 0 ? 'You must select a file to upload.' : undefined;

    this.setState({ errorMessage });
    return errorMessage;
  };

  saveParameters = () => {
    const errorMessage = this.validateParameters();
    const {
      saveNlpNode,
      setShowRightPanel,
      setTabularResults,
      children,
      workingId,
      ...rest
    } = this.props;
    const { files } = this.state;
    const fileList = Array.from(files);
    const fileNames = fileList.map((f) => {
      return { name: f.name };
    });

    if (!errorMessage) {
      const node = {
        ...rest,
        files: fileNames,
        isValid: true,
      };
      this.props.saveNlpNode({ node });
    }
  };

  onSavePane = () => {
    this.props.setShowRightPanel({ showPanel: false });
  };

  render() {
    const { isValid } = this.props;
    const { files, errorMessage } = this.state;
    const showFileControl = files.length === 0;
    const fileItems = this.getFileUploadList();

    return (
      <div className="input-panel">
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {showFileControl && (
          <FileUploader
            accept={['.txt']}
            buttonKind="primary"
            buttonLabel="Select files"
            filenameStatus="edit"
            labelDescription="only .txt files at 10mb or less"
            labelTitle="Upload files"
            size={'sm'}
            onChange={this.onFilesSelected}
          />
        )}
        {!showFileControl && (
          <div className="files-selected">
            <label className="bx--file--label">Files to upload</label>
            {fileItems}
            {!isValid && (
              <Button
                kind="primary"
                size="sm"
                className="btn-upload"
                onClick={this.onUploadFiles}
              >
                Upload
              </Button>
            )}
          </div>
        )}
        <RHSPanelButtons
          showSaveButton={false}
          onClosePanel={() => {
            this.props.setShowRightPanel({ showPanel: false });
          }}
        />
      </div>
    );
  }
}

InputPanel.defaultProps = {
  files: [],
};

const mapStateToProps = (state) => ({
  workingId: state.nodesReducer.workingId,
});

const mapDispatchToProps = (dispatch) => ({
  saveNlpNode: (node) => dispatch(saveNlpNode(node)),
  setShowRightPanel: (doShow) => dispatch(setShowRightPanel(doShow)),
  setTabularResults: (data) => dispatch(setTabularResults(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(InputPanel);
