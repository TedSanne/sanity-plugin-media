import {Box, Text} from '@sanity/ui'
import React, {FC, Ref, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import {ListOnItemsRenderedProps, GridOnItemsRenderedProps} from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import {PANEL_HEIGHT} from '../../constants'

import useBreakpointIndex from '../../hooks/useBreakpointIndex'
import useTypedSelector from '../../hooks/useTypedSelector'
import {assetsActions, selectAssets, selectAssetsPickedLength} from '../../modules/assets'
import {tagsActions} from '../../modules/tags'
import {selectUploads} from '../../modules/uploads'
import Cards from '../Cards'
import Table from '../Table'

type InfiniteLoaderRenderProps = {
  onItemsRendered: (props: ListOnItemsRenderedProps) => any
  ref: Ref<any>
}

const Items: FC = () => {
  // Redux
  const dispatch = useDispatch()
  const fetchCount = useTypedSelector(state => state.assets.fetchCount)
  const fetching = useTypedSelector(state => state.assets.fetching)
  const pageSize = useTypedSelector(state => state.assets.pageSize)
  const tagsPanelVisible = useTypedSelector(state => state.tags.panelVisible)
  const view = useTypedSelector(state => state.assets.view)
  const items = useTypedSelector(selectAssets)
  const pickedCount = useTypedSelector(selectAssetsPickedLength)
  const uploads = useTypedSelector(selectUploads)

  const breakpointIndex = useBreakpointIndex()

  // const hasFetchedOnce = totalCount >= 0
  const hasFetchedOnce = fetchCount >= 0
  const hasItems = items.length + uploads.length > 0

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) => {
    return index < items.length
  }

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const handleLoadMoreItems = () => {
    if (!fetching) {
      dispatch(assetsActions.loadNextPage())
    }
    return new Promise(() => {})
  }

  // Effects

  // - Hide tag panel on smaller breakpoints
  useEffect(() => {
    if (breakpointIndex <= 1 && tagsPanelVisible) {
      dispatch(tagsActions.panelVisibleSet({panelVisible: false}))
    }
  }, [breakpointIndex])

  // NOTE: The below is a workaround and can be inaccurate in certain cases.
  // e.g. if `pageSize` is 10 and you have fetched 10 items, `hasMore` will still be true
  // and another fetch will invoked on next page (which will return 0 items).
  // This is currently how the default asset source in Sanity works.
  // TODO: When it's performant enough to get total asset count across large datasets, revert
  // to using `totalCount` across the board.
  const hasMore = fetchCount === pageSize
  // const hasMore = (pageIndex + 1) * pageSize < totalCount

  // If there are more items to be loaded then add an extra placeholder row to trigger additional page loads.
  const itemCount = hasMore ? items.length + 1 : items.length

  const isEmpty = !hasItems && hasFetchedOnce && !fetching

  return (
    <Box
      flex={1}
      style={{
        height: '100%',
        left: 0,
        paddingTop: pickedCount > 0 ? PANEL_HEIGHT : 0,
        position: 'absolute',
        top: 0,
        width: '100%'
      }}
    >
      {isEmpty && (
        <Box padding={4}>
          <Text size={1} weight="semibold">
            No results for the current query
          </Text>
        </Box>
      )}
      {!isEmpty && (view === 'grid' || 'table') && (
        <AutoSizer>
          {({height, width}) => {
            const containerHeight = pickedCount > 0 ? height - PANEL_HEIGHT : height

            // TODO: double check itemCount usage with InfiniteLoader + uploads
            return (
              <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={handleLoadMoreItems}
              >
                {({onItemsRendered, ref}: InfiniteLoaderRenderProps) => {
                  // View: Table
                  if (view === 'table') {
                    return (
                      <Table
                        height={containerHeight}
                        items={items}
                        onItemsRendered={onItemsRendered}
                        ref={ref}
                        uploads={uploads}
                        width={width}
                      />
                    )
                  }

                  // View: Grid
                  if (view === 'grid') {
                    // The `onItemsRendered` method signature for `react-window` grids is different and
                    // requires an adaptor, below.
                    // Source: https://github.com/bvaughn/react-window-infinite-loader/issues/3
                    const newItemsRendered = (gridData: GridOnItemsRenderedProps) => {
                      const {
                        overscanRowStartIndex,
                        overscanRowStopIndex,
                        overscanColumnStopIndex
                      } = gridData

                      const endCol = overscanColumnStopIndex + 1
                      const startRow = overscanRowStartIndex
                      const endRow = overscanRowStopIndex
                      const visibleStartIndex = startRow * endCol
                      const visibleStopIndex = endRow * endCol

                      onItemsRendered({
                        overscanStartIndex: visibleStartIndex - 10,
                        overscanStopIndex: visibleStopIndex + 10,
                        visibleStartIndex,
                        visibleStopIndex
                      })
                    }

                    return (
                      <Cards
                        height={containerHeight}
                        items={items}
                        onItemsRendered={newItemsRendered}
                        ref={ref}
                        uploads={uploads}
                        width={width}
                      />
                    )
                  }
                }}
              </InfiniteLoader>
            )
          }}
        </AutoSizer>
      )}
    </Box>
  )
}

export default Items
