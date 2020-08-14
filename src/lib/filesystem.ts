import path from "path"

export const createPath = (yourPath: string, cwd: string): string => {
  // this checks if path is absolute
  if (path.resolve(yourPath) === path.normalize(yourPath)) {
    return yourPath
  }

  return path.join(cwd, yourPath)
}
