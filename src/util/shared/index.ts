/**
 * Helper function that returns an array from a passed String
 * @param {String} string String to get converted to array
 */
export function stringToArray(string: string): Array<string> {
  return string.trim().split(' ')
}

/**
 * Helper function that returns a boolean if String matches common video extensions
 * @param {String} media String used to test matches
 */
export function isVideo(media: string): boolean {
  return /\.(webm|mp4|ogg)$/.test(media)
}
