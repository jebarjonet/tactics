import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

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
  background-color: ${({ groupIndex }) => {
    switch (groupIndex) {
      case 0: // current player
        return '#df8a00'
      case 1: // allies
        return '#ccba71'
      case 2: // enemies
        return '#cc5e75'
      case 3: // unwalkable points
        return '#5d5d5d'
      case 4: // zone
        return '#833ccc'
      case 5: // zone
        return '#6ba2d9'
      case 6: // zone
        return '#47d457'
      case 7: // zone
        return '#537da8'
      case 8: // zone
        return '#36a243'
      default:
        return '#f4f4f4'
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

  cellConfig = (x, y) => {
    const { groups } = this.props

    let config = {
      groupIndex: -1,
    }

    groups.some((group, index) => {
      const point = group.find(cell => cell.x === x && cell.y === y)

      if (!point) {
        return false
      }

      config = {
        groupIndex: index,
        point,
      }
      return true
    })

    return config
  }

  render() {
    const { height, width } = this.props

    return (
      <Board>
        {[...new Array(height)].map((_, rowIndex) => {
          return (
            <Row key={rowIndex}>
              {[...new Array(width)].map((_, cellIndex) => {
                const { groupIndex, point } = this.cellConfig(
                  cellIndex,
                  rowIndex,
                )
                return (
                  <Cell
                    key={cellIndex}
                    groupIndex={groupIndex}
                    title={`(x:${cellIndex} y: ${rowIndex})`}
                  >
                    {!!point && (point.score || point.cost)}
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
