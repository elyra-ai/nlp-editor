import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, TextInput } from 'carbon-components-react';
import RHSPanelButtons from '../../components/rhs-panel-buttons';
import classNames from 'classnames';
import { connect } from 'react-redux';

// import './dictionary-panel.scss';

import { saveNlpNode, setShowRightPanel } from '../../../redux/slice';

class LiteralPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: props.inputText,
      lemmaMatch: props.lemmaMatch,
      errorMessage: undefined,
    };
  }

  componentDidUpdate(prevProps) {
  }

  onChangeLemmaMatch = (value) => {
    this.setState({ lemmaMatch: value });
  };

  onSavePane = () => {
    const errorMessage = this.validateParameters();
    const {lemmaMatch, inputText } =
      this.state;
    const { nodeId } = this.props;

    if (!errorMessage) {
      const node = {
        nodeId,
        inputText,
        lemmaMatch,
        isValid: true,
      };
      this.props.saveNlpNode({ node });
      this.props.setShowRightPanel({ showPanel: false });
    }
  };

  validateParameters = () => {
    const { inputText } = this.state;

    const errorMessage =
      inputText.length === 0 ? 'You must enter a string to match.' : undefined;

    this.setState({ errorMessage });
    return errorMessage;
  };

  render() {
    const {
      inputText,
      lemmaMatch,
      errorMessage,
    } = this.state;
    return (
      <div className="literal-panel">
        <div
          className={classNames('input-controls', {
            error: errorMessage !== undefined,
          })}
        >
          <TextInput
            id="inputTextMatch"
            labelText="Value to match in text:"
            type="text"
            size="sm"
            invalid={errorMessage !== undefined}
            invalidText={errorMessage}
            onChange={(e) => {
              this.setState({ inputText: e.target.value });
            }}
            onKeyDown={(e) => {
              const keyPressed = e.key || e.keyCode;
              if (keyPressed === 'Enter' || keyPressed === 13) {
                this.onUpdateList();
              }
            }}
            value={inputText}
          />
        </div>
        <Checkbox
          labelText="Lemma Match"
          id="chkLemmaMatch"
          onChange={this.onChangeLemmaMatch}
          checked={lemmaMatch}
        />
		<RHSPanelButtons
          onClosePanel={() => {
            this.props.setShowRightPanel({ showPanel: false });
          }}
          onSavePanel={this.onSavePane}
        />
      </div>
    );
  }
}

LiteralPanel.propTypes = {
  nodeId: PropTypes.string.isRequired,
};

LiteralPanel.defaultProps = {
  inputText: '',
  lemmaMatch: false
};

const mapStateToProps = (state) => ({
  pipelineId: state.nodesReducer.pipelineId,
});

const mapDispatchToProps = (dispatch) => ({
  saveNlpNode: (node) => dispatch(saveNlpNode(node)),
  setShowRightPanel: (doShow) => dispatch(setShowRightPanel(doShow)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LiteralPanel);