import {
  createPlugin,
  BladePlugin,
  FolderController,
  FolderApi,
  FolderBladeParams,
  ValueMap,
  FolderPropsObject,
  parseRecord
} from '@tweakpane/core'

interface ImportExportBladeParams extends Omit<FolderBladeParams, 'view' | 'root'> {
  view: 'import-export'
}

export const id = 'import-export'

export const plugin = createPlugin<BladePlugin<ImportExportBladeParams>>({
  id: 'import-export',
  type: 'blade',

  accept(params) {
    const result = parseRecord<ImportExportBladeParams>(params, (p) => ({
      title: p.optional.string,
      view: p.required.constant('import-export'),
      expanded: p.optional.boolean
    }))

    return result ? { params: result } : null
  },

  controller(args) {
    const controller = new FolderController(args.document, {
      blade: args.blade,
      expanded: args.params.expanded as boolean,
      root: true,
      props: ValueMap.fromObject<FolderPropsObject>({
        title: args.params.title as string || 'Import / Export',
      }),
      viewProps: args.viewProps
    })

    controller.importState = () => true
    controller.exportState = () => ({})

    return controller
  },

  api(args) {
    if (!(args.controller instanceof FolderController)) {
      return null
    }

    const config: any = { value: '' }

    const api = new FolderApi(args.controller, args.pool)
    const binding = api.addBinding(config, 'value')
    const importButton = api.addButton({ title: 'Import' })
    const exportButton = api.addButton({ title: 'Export' })

    const apiButtonElement = api.element.querySelector('button')!
    const bindingContainerElement = binding.element.querySelector<HTMLElement>('.tp-lblv_v')!
    const bindingInputElement = binding.element.querySelector('input')!
    const importButtonElement = importButton.element.querySelector('button')!
    const exportButtonElement = exportButton.element.querySelector('button')!
    const buttonsContainer = importButton.element.querySelector<HTMLElement>('.tp-btnv')!

    api.element.style.overflow = 'hidden'
    apiButtonElement.style.textAlign = 'left'
    apiButtonElement.style.paddingLeft = '8px'
    bindingContainerElement.style.width = '100%'
    bindingInputElement.placeholder = 'Copy / Paste config here'
    buttonsContainer.style.display = 'flex'
    importButtonElement.style.marginRight = '2px'
    exportButtonElement.style.marginLeft = '2px'

    binding.element.querySelector('.tp-lblv_l')!.remove()
    buttonsContainer.appendChild(exportButtonElement)
    exportButton.element.remove()

    importButton.on('click', () => {
      if (!config.value.trim()) {
        alert('No tweakpane config to import')
        return
      }

      let data: any = undefined

      try {
        data = JSON.parse(config.value)
      } catch(_) {

      }

      if (!data || typeof data !== 'object' || !Array.isArray(data.children)) {
        alert('Could not parse tweakpane config')
        throw new Error('Could not parse tweakpane config')
      }

      for (let i = 0; i < api.controller.parent!.children.length; i++) {
        const child = api.controller.parent!.children[i]
        child === api.controller || child.importState(data.children[i])
      }
    })

    exportButton.on('click', () => {
      config.value = JSON.stringify({
        disabled: false,
        expanded: true,
        hidden: false,
        title: undefined,
        children: api.controller.parent!.children.map(child => (
          child.exportState()
        ))
      })

      binding.refresh()
      bindingInputElement.focus()
      bindingInputElement.select()
      navigator.clipboard.writeText(config.value)
    })

    return api
  },
})
