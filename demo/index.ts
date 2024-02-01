import { Pane } from 'tweakpane'
import * as ImportExportPlugin from '../src'

const config = {
  messageA: 'hey',
  messageB: 'hey hey',
}

const pane = new Pane()

pane.registerPlugin(ImportExportPlugin)

pane.addBinding(config, 'messageA')

pane
  .addFolder({ title: 'Folder' })
  .addBinding(config, 'messageB')

pane.addBlade({ view: 'import-export' })

