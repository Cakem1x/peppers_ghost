# Pepper's Ghost for WHY2025 Badge With Cone
I am trying to get a setup running that allows you to use the [WHY2025 Badge](https://wiki.why2025.org/Badge) as a [Pepper's Ghost](https://en.wikipedia.org/wiki/Pepper%27s_ghost) display.

Inspired by [Roxanne Luo's Pepper's Cone](https://roxanneluo.github.io/PeppersCone.html).

The idea is to use the badge's display and a DIY transparent plastic cone to get a small pepper's ghost dislay setup.
The cone will distort the rendered image a lot, so we apply a predistortion to the image such that the image reflected from the cone looks normal.

# The Plan
The project consists of three parts: Two for calibration and one for rendering predistorted images on the badge.

## Render Calibration Video (Badge) - ToDo (0%)
The badge should render a (repeating) video with stripe patterns that allows the Calibration Video Analyzer to uniquely identify each pixel.

## Calibration Video Analyzer (Smartphone via [Github Page](https://cakem1x.github.io/peppers_ghost/)) - In Progress (30%)
* Smartphone (or other camera) records the **distorted pattern** of the Calibration Video.
* JS code (all client-side) calculates a calibration mapping. Maps each original screen pixel (x,y) to the distorted screen pixel (x', y').
* Export the calibration mapping

## Predistorted Renderer (Badge) - ToDo (0%)
* Import calibration pattern from Calibration Video Analyzer.
* Pick image to display
* Render predistorted image
