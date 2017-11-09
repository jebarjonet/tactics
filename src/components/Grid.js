import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { findIndex } from 'lodash/fp'

const CELL_SIZE = 20

const Board = styled.div`
  font-family: monospace;
`

const Row = styled.div`
  display: flex;
`

const Cell = styled.div`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  font-size: ${CELL_SIZE / 2}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ group }) => {
    switch (group) {
      case 1: // main points
        return '#cc9b4d'
      case 2: // path
        return '#cc5e75'
      case 3: // blocked points
        return '#5d5d5d'
      case 4: // zone 1
        return '#6fa5cc'
      case 5: // zone 2
        return '#6ccc51'
    }
  }};
`

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
    const existingGroupId = findIndex(group => {
      return group.some(cell => cell.x === x && cell.y === y)
    })(this.props.groups)
    return existingGroupId >= 0 ? existingGroupId + 1 : '.'
  }

  render() {
    const { height, width } = this.props

    return (
      <Board>
        {[...new Array(height)].map((_, rowIndex) => {
          return (
            <Row key={rowIndex}>
              {[...new Array(width)].map((_, cellIndex) => {
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
