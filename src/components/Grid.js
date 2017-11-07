import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import _ from 'lodash/fp'

const CELL_SIZE = '20px'

const Board = styled.div`
  font-family: monospace;
`

const Row = styled.div`
  display: flex;
`

const Cell = styled.div`
  width: ${CELL_SIZE};
  height: ${CELL_SIZE};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ group }) => {
    switch (group) {
      case 1:
        return '#cc9b4d'
      case 2:
        return '#cc5e75'
      case 3:
        return '#6fa5cc'
      case 4:
        return '#6ccc51'
    }
  }};
`

/**
 * Transforms a nodeHash into array of Nodes
 * @param nodeHash
 * @returns {*}
 */
export const hashToArray = nodeHash => {
  return _.flow([_.map(_.map(_.identity)), _.flattenDeep])(nodeHash)
}

class Grid extends Component {
  static propTypes = {
    height: PropTypes.number,
    groups: PropTypes.array,
    width: PropTypes.number,
  }

  static defaultProps = {
    groups: [],
  }

  cellValue = (x, y) => {
    const existingGroupId = _.findIndex(group => {
      return group.some(cell => cell.x === x && cell.y === y)
    })(this.props.groups)
    return existingGroupId >= 0 ? existingGroupId + 1 : '.'
  }

  render() {
    const { height, width } = this.props

    return (
      <Board>
        {new Array(height).fill(0).map((zero, rowIndex) => {
          return (
            <Row key={rowIndex}>
              {new Array(width).fill(0).map((zero, cellIndex) => {
                const value = this.cellValue(cellIndex, rowIndex)

                return (
                  <Cell key={cellIndex} group={value}>
                    {value}
                  </Cell>
                )
              })}
            </Row>
          )
        })}
      </Board>
    )
  }
}

export default Grid
