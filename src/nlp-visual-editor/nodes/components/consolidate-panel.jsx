/*

Copyright 2022 Elyra Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'carbon-components-react';
import { AttributesList, RHSPanelButtons } from '../../components';

import { getImmediateUpstreamNodes } from '../../../utils';
import { saveNlpNode, setShowRightPanel } from '../../../redux/slice';

class ConsolidatePanel extends React.Component {
  constructor(props) {
    super(props);
    let upstreamNodes = props.upstreamNodes;
    const pipelineLinks = props.canvasController.getLinks(props.pipelineId);
    if (!upstreamNodes) {
      const immediateNodes = getImmediateUpstreamNodes(
        props.nodeId,
        pipelineLinks,
      );
      upstreamNodes = [];
      immediateNodes.forEach((id, index) => {
        const node = props.nodes.find((n) => n.nodeId === id);
        const { label, nodeId, type } = node;
        upstreamNodes.push({ label, nodeId, type });
      });
    }

    this.state = {
      upstreamNodes: upstreamNodes,
      attributes: this.getAttributes(props.consolidateTarget),
      consolidateTarget: props.consolidateTarget,
      consolidatePolicy: props.consolidatePolicy,
      consolidateMethod: [
        {
          id: 'ContainedWithin',
          text: 'Contained Within',
        },
        {
          id: 'NotContainedWithin',
          text: 'Not Contained Within',
        },
        {
          id: 'ContainsButNotEqual',
          text: 'Contains But Not Equal',
        },
        {
          id: 'ExactMatch',
          text: 'Exact match',
        },
        {
          id: 'LeftToRight',
          text: 'Left To Right',
        },
      ],
    };
  }

  getAttributes(consolidateTarget) {
    const { nodes } = this.props;
    const primaryNodeLabel = this.state?.consolidateTarget ?? consolidateTarget;
    if (!primaryNodeLabel) {
      return [];
    }
    const primaryNode = nodes.find((n) => n.label === primaryNodeLabel);
    return (
      primaryNode?.attributes?.map((attr) => {
        return {
          ...attr,
          disabled: false,
        };
      }) ?? []
    );
  }

  validateParameters = () => {
    const { consolidatePolicy, consolidateTarget } = this.state;
    const { nodeId } = this.props;

    const node = {
      nodeId,
      consolidateTarget,
      consolidatePolicy,
      isValid: true,
    };
    this.props.saveNlpNode({ node });
    this.props.setShowRightPanel({ showPanel: false });
  };

  render() {
    const { attributes } = this.state;
    return (
      <div className="sequence-panel">
        Manage overlapping matches
        <Dropdown
          id="output"
          size="sm"
          light
          label="Output Column"
          initialSelectedItem={this.state.upstreamNodes.find(
            (item) => this.state.consolidateTarget == item.label,
          )}
          items={this.state.upstreamNodes}
          itemToString={(item) => (item ? item.label : '')}
          onChange={(e) => {
            this.setState({
              consolidateTarget: e.selectedItem.label,
              attributes: this.getAttributes(e.selectedItem.label),
            });
          }}
        />
        <Dropdown
          id="method"
          size="sm"
          light
          label="Method"
          initialSelectedItem={this.state.consolidateMethod.find(
            (item) => this.state.consolidatePolicy == item.id,
          )}
          items={this.state.consolidateMethod}
          itemToString={(item) => (item ? item.text : '')}
          onChange={(e) => {
            this.setState({
              consolidatePolicy: e.selectedItem.id,
            });
          }}
        />
        <AttributesList
          attributes={attributes}
          onChange={(newAttributes) => {
            this.setState({ attributes: newAttributes });
          }}
          label={this.props.label}
        />
        <RHSPanelButtons
          onClosePanel={() => {
            this.props.setShowRightPanel({ showPanel: false });
          }}
          onSavePanel={this.validateParameters}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  nodes: state.nodesReducer.nodes,
  pipelineId: state.nodesReducer.pipelineId,
});

const mapDispatchToProps = (dispatch) => ({
  saveNlpNode: (node) => dispatch(saveNlpNode(node)),
  setShowRightPanel: (doShow) => dispatch(setShowRightPanel(doShow)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConsolidatePanel);
