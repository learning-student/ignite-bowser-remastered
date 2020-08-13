/**
 * NOTE TO DEVS:
 *
 * Spacing should be consistent and whitespace thought of as a first class technique up
 * there with color and typefaces.
 *
 * Which type of scale you use is based on the design.
 *
 * If you've got simpler app, you may only need 6 items.  Or maybe you want a spacing scale
 * to be named:
 *
 * export const spacing = {
 *   tiny: 4,
 *   small: 8,
 *   medium: 12,
 *   large: 24,
 *   huge: 64
 * }
 *
 * Whatever you choose, try to stick with these, and not freestyle it everywhere.
 *
 * Feel free to delete this block.
 */

/**
 * The available spacing.
 *
 * Here's the rough guideline.  Customize this for you usage.  It's ok to put exceptions
 * within the components themselves if they are truly exceptions.
 *
 * 0 = none    - nothing. only here to bust out of a zero-based array.
 * 1 = xsmall    - elements contextually close to each other
 * 2 = small - for groups of closely related items or perhaps borders
 * 4 = medium  - ?
 * 5 = xmedium - ?
 * 6 = large   - between groups of content that aren't related?
 * 7 = huge    - ?
 */


export interface SpacingInterface {
  none: number,
  xsmall: number,
  small: number,
  medium: number,
  xmedium: number,
  large: number,
  huge: number
}

export const spacing: SpacingInterface = {
  none: 0,
  xsmall: 5,
  small: 10,
  medium: 15,
  xmedium: 20,
  large: 25,
  huge: 30,
}
