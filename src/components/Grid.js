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
  background-color: #f4f4f4;
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

    groups.every((group, index) => {
      const point = group.points.find(cell => cell.x === x && cell.y === y)

      if (!point) {
        return true
      }

      config = {
        groupIndex: index,
        point,
      }
    })

    return config
  }

  render() {
    const { groups, height, width } = this.props

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
                    title={`(x:${cellIndex} y: ${rowIndex})`}
                    style={{
                      backgroundColor:
                        groupIndex !== -1 && groups[groupIndex].color,
                    }}
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
