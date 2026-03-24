/**
 * Media selection composable
 * Manages selection mode state for batch operations
 */
import { ref, computed, type Ref } from 'vue'

export interface SelectableItem {
  id: string
}

export function useMediaSelection<T extends SelectableItem>(items: Ref<T[]>) {
  // Selection mode state
  const isSelectionMode = ref(false)
  const selectedIds = ref<Set<string>>(new Set())

  // Computed
  const selectedCount = computed(() => selectedIds.value.size)
  const hasSelection = computed(() => selectedIds.value.size > 0)
  const allSelected = computed(() =>
    items.value.length > 0 && selectedIds.value.size === items.value.length
  )

  // Get selected items
  const selectedItems = computed(() =>
    items.value.filter(item => selectedIds.value.has(item.id))
  )

  // Toggle selection mode
  function toggleSelectionMode() {
    isSelectionMode.value = !isSelectionMode.value
    if (!isSelectionMode.value) {
      // Clear selection when exiting selection mode
      selectedIds.value.clear()
    }
  }

  // Enter selection mode
  function enterSelectionMode() {
    isSelectionMode.value = true
  }

  // Exit selection mode and clear selection
  function exitSelectionMode() {
    isSelectionMode.value = false
    selectedIds.value.clear()
  }

  // Toggle single item selection
  function toggleSelection(id: string) {
    const newSet = new Set(selectedIds.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    selectedIds.value = newSet
  }

  // Select single item
  function select(id: string) {
    const newSet = new Set(selectedIds.value)
    newSet.add(id)
    selectedIds.value = newSet
  }

  // Deselect single item
  function deselect(id: string) {
    const newSet = new Set(selectedIds.value)
    newSet.delete(id)
    selectedIds.value = newSet
  }

  // Select all items
  function selectAll() {
    selectedIds.value = new Set(items.value.map(item => item.id))
  }

  // Deselect all items
  function deselectAll() {
    selectedIds.value = new Set()
  }

  // Check if item is selected
  function isSelected(id: string): boolean {
    return selectedIds.value.has(id)
  }

  // Clear selection after batch operation
  function clearSelectionAfterOperation() {
    selectedIds.value.clear()
    isSelectionMode.value = false
  }

  return {
    // State
    isSelectionMode,
    selectedIds,
    selectedCount,
    hasSelection,
    allSelected,
    selectedItems,

    // Actions
    toggleSelectionMode,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelection,
    select,
    deselect,
    selectAll,
    deselectAll,
    isSelected,
    clearSelectionAfterOperation
  }
}
