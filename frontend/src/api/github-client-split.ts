/**
 * GitHub Client - Large File Splitting Support
 * 
 * Handles automatic splitting of large JSON files (>800KB) into multiple chunks
 * to avoid GitHub API's 1MB content limit.
 */

export const MAX_FILE_SIZE = 800 * 1024 // 800KB - stay under 1MB GitHub limit
const SPLIT_FILE_PATTERN = /^(.+)\.(\d+)\.json$/

export interface SplitFileInfo {
  baseName: string
  chunkIndex: number
  fullPath: string
}

/**
 * Parse split file name to extract base name and chunk index
 */
export function parseSplitFileName(fileName: string): SplitFileInfo | null {
  const match = fileName.match(SPLIT_FILE_PATTERN)
  if (!match) return null
  
  return {
    baseName: match[1],
    chunkIndex: parseInt(match[2], 10),
    fullPath: fileName,
  }
}

/**
 * Get all split file paths for a given base file path
 */
export function getSplitFilePaths(basePath: string, maxChunks: number = 100): string[] {
  const paths: string[] = []
  for (let i = 0; i < maxChunks; i++) {
    const dir = basePath.substring(0, basePath.lastIndexOf('/'))
    const fileName = basePath.substring(basePath.lastIndexOf('/') + 1)
    const nameWithoutExt = fileName.replace(/\.json$/, '')
    const splitPath = `${dir}/${nameWithoutExt}.${i}.json`
    paths.push(splitPath)
  }
  return paths
}

/**
 * Estimate JSON string size in bytes
 */
export function estimateJsonSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size
}

/**
 * Split a large data object into chunks
 * For arrays, splits the items array. For objects, tries to split arrays within.
 */
export function splitDataIntoChunks<T>(data: T, basePath: string): Array<{ path: string; data: T }> {
  const chunks: Array<{ path: string; data: T }> = []
  
  // Handle objects with 'items' array (like forms.json, submissions.json)
  if (typeof data === 'object' && data !== null && 'items' in data && Array.isArray((data as any).items)) {
    const obj = data as any
    const items = obj.items || []
    const metadata = { ...obj }
    delete metadata.items
    
    // Calculate how many items per chunk
    const sampleItem = items[0]
    const itemSize = sampleItem ? estimateJsonSize(sampleItem) : 1000
    const itemsPerChunk = Math.max(1, Math.floor(MAX_FILE_SIZE / (itemSize * 1.2))) // 1.2x safety margin
    
    // Split items into chunks
    for (let i = 0; i < items.length; i += itemsPerChunk) {
      const chunkItems = items.slice(i, i + itemsPerChunk)
      const chunkIndex = Math.floor(i / itemsPerChunk)
      
      const dir = basePath.substring(0, basePath.lastIndexOf('/'))
      const fileName = basePath.substring(basePath.lastIndexOf('/') + 1)
      const nameWithoutExt = fileName.replace(/\.json$/, '')
      const chunkPath = `${dir}/${nameWithoutExt}.${chunkIndex}.json`
      
      chunks.push({
        path: chunkPath,
        data: {
          ...metadata,
          items: chunkItems,
          chunkIndex,
          totalChunks: Math.ceil(items.length / itemsPerChunk),
        } as T,
      })
    }
    
    // If no items, still create one chunk with metadata
    if (chunks.length === 0) {
      chunks.push({
        path: basePath,
        data: {
          ...metadata,
          items: [],
          chunkIndex: 0,
          totalChunks: 1,
        } as T,
      })
    }
  }
  // Handle objects with 'users' array (like users_auth.json)
  else if (typeof data === 'object' && data !== null && 'users' in data && Array.isArray((data as any).users)) {
    const obj = data as any
    const users = obj.users || []
    const metadata = { ...obj }
    delete metadata.users
    
    // Calculate how many users per chunk
    const sampleUser = users[0]
    const userSize = sampleUser ? estimateJsonSize(sampleUser) : 1000
    const usersPerChunk = Math.max(1, Math.floor(MAX_FILE_SIZE / (userSize * 1.2))) // 1.2x safety margin
    
    // Split users into chunks
    for (let i = 0; i < users.length; i += usersPerChunk) {
      const chunkUsers = users.slice(i, i + usersPerChunk)
      const chunkIndex = Math.floor(i / usersPerChunk)
      
      const dir = basePath.substring(0, basePath.lastIndexOf('/'))
      const fileName = basePath.substring(basePath.lastIndexOf('/') + 1)
      const nameWithoutExt = fileName.replace(/\.json$/, '')
      const chunkPath = `${dir}/${nameWithoutExt}.${chunkIndex}.json`
      
      chunks.push({
        path: chunkPath,
        data: {
          ...metadata,
          users: chunkUsers,
          chunkIndex,
          totalChunks: Math.ceil(users.length / usersPerChunk),
        } as T,
      })
    }
    
    // If no users, still create one chunk with metadata
    if (chunks.length === 0) {
      chunks.push({
        path: basePath,
        data: {
          ...metadata,
          users: [],
          chunkIndex: 0,
          totalChunks: 1,
        } as T,
      })
    }
  }
  // Handle objects with 'admins' array (like admins_auth.json)
  else if (typeof data === 'object' && data !== null && 'admins' in data && Array.isArray((data as any).admins)) {
    const obj = data as any
    const admins = obj.admins || []
    const metadata = { ...obj }
    delete metadata.admins
    
    // Calculate how many admins per chunk
    const sampleAdmin = admins[0]
    const adminSize = sampleAdmin ? estimateJsonSize(sampleAdmin) : 1000
    const adminsPerChunk = Math.max(1, Math.floor(MAX_FILE_SIZE / (adminSize * 1.2))) // 1.2x safety margin
    
    // Split admins into chunks
    for (let i = 0; i < admins.length; i += adminsPerChunk) {
      const chunkAdmins = admins.slice(i, i + adminsPerChunk)
      const chunkIndex = Math.floor(i / adminsPerChunk)
      
      const dir = basePath.substring(0, basePath.lastIndexOf('/'))
      const fileName = basePath.substring(basePath.lastIndexOf('/') + 1)
      const nameWithoutExt = fileName.replace(/\.json$/, '')
      const chunkPath = `${dir}/${nameWithoutExt}.${chunkIndex}.json`
      
      chunks.push({
        path: chunkPath,
        data: {
          ...metadata,
          admins: chunkAdmins,
          chunkIndex,
          totalChunks: Math.ceil(admins.length / adminsPerChunk),
        } as T,
      })
    }
    
    // If no admins, still create one chunk with metadata
    if (chunks.length === 0) {
      chunks.push({
        path: basePath,
        data: {
          ...metadata,
          admins: [],
          chunkIndex: 0,
          totalChunks: 1,
        } as T,
      })
    }
  } else {
    // For other structures, just check size and split if needed
    const size = estimateJsonSize(data)
    if (size > MAX_FILE_SIZE) {
      // For non-array structures, we can't easily split
      // Just return as-is and let the write function handle it
      console.warn(`File ${basePath} is large (${size} bytes) but cannot be auto-split. Consider manual splitting.`)
    }
    chunks.push({ path: basePath, data })
  }
  
  return chunks
}

/**
 * Merge split chunks back into a single data object
 */
export function mergeChunksIntoData<T>(chunks: Array<{ path: string; data: T }>): T {
  if (chunks.length === 0) {
    return {} as T
  }
  
  if (chunks.length === 1) {
    const chunk = chunks[0].data as any
    // Remove chunk metadata if present
    if ('chunkIndex' in chunk) {
      delete chunk.chunkIndex
      delete chunk.totalChunks
    }
    return chunks[0].data
  }
  
  // Sort chunks by chunkIndex
  const sortedChunks = chunks
    .map(chunk => {
      const parsed = parseSplitFileName(chunk.path.split('/').pop() || '')
      return {
        ...chunk,
        chunkIndex: parsed?.chunkIndex ?? 0,
      }
    })
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
  
  // Merge arrays from all chunks
  const firstChunk = sortedChunks[0].data as any
  const merged: any = { ...firstChunk }
  
  // Remove chunk metadata
  delete merged.chunkIndex
  delete merged.totalChunks
  
  // Merge 'items' arrays (for forms.json, submissions.json, etc.)
  if ('items' in merged && Array.isArray(merged.items)) {
    merged.items = []
    for (const chunk of sortedChunks) {
      const chunkData = chunk.data as any
      if (chunkData.items && Array.isArray(chunkData.items)) {
        merged.items.push(...chunkData.items)
      }
    }
  }
  
  // Merge 'users' arrays (for users_auth.json)
  if ('users' in merged && Array.isArray(merged.users)) {
    merged.users = []
    for (const chunk of sortedChunks) {
      const chunkData = chunk.data as any
      if (chunkData.users && Array.isArray(chunkData.users)) {
        merged.users.push(...chunkData.users)
      }
    }
  }
  
  // Merge 'admins' arrays (for admins_auth.json)
  if ('admins' in merged && Array.isArray(merged.admins)) {
    merged.admins = []
    for (const chunk of sortedChunks) {
      const chunkData = chunk.data as any
      if (chunkData.admins && Array.isArray(chunkData.admins)) {
        merged.admins.push(...chunkData.admins)
      }
    }
  }
  
  return merged as T
}

/**
 * Check if a file path is a split file
 */
export function isSplitFile(filePath: string): boolean {
  return SPLIT_FILE_PATTERN.test(filePath.split('/').pop() || '')
}

/**
 * Get the base path from a split file path
 */
export function getBasePathFromSplit(splitPath: string): string {
  const fileName = splitPath.split('/').pop() || ''
  const match = fileName.match(SPLIT_FILE_PATTERN)
  if (!match) return splitPath
  
  const baseName = match[1]
  const dir = splitPath.substring(0, splitPath.lastIndexOf('/'))
  return `${dir}/${baseName}.json`
}

