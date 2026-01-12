import { computed, Directive, effect, ElementRef, input, NgModule, Renderer2, signal } from '@angular/core';
import { cn, equals } from '@primeuix/utils';

/**
 * Bind directive provides dynamic attribute, property, and event listener binding functionality.
 * @group Components
 */
@Directive({
    selector: '[pBind]',
    standalone: true,
    host: {
        '[style]': 'styles()',
        '[class]': 'classes()'
    }
})
export class Bind {
    /**
     * Dynamic attributes, properties, and event listeners to be applied to the host element.
     * @group Props
     */
    pBind = input<{ [key: string]: any } | undefined>(undefined);

    private _attrs = signal<{ [key: string]: any } | undefined>(undefined);
    private attrs = computed(() => this._attrs() || this.pBind());

    styles = computed(() => this.attrs()?.style);
    classes = computed(() => cn(this.attrs()?.class));

    // estrutura de listener melhorada para rastrear o handler específico
    private listeners: { eventName: string; handler: Function; unlisten: () => void }[] = [];
    
    // variável adicionada para armazenar o estado anterior dos atributos e permitir o "diffing" (comparação para remoção)
    private _lastAttrs?: { [key: string]: any } = undefined;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) {
        effect(() => {
            const { style, class: className, ...rest } = this.attrs() || {};

            const prev = this._lastAttrs || {};
            const prevKeys = new Set(Object.keys(prev));
            const currKeys = new Set(Object.keys(rest));

            // lógica de diffing adicionada para remover atributos que não existem mais no novo input
            for (const key of prevKeys) {
                if (!currKeys.has(key)) {
                    if (key.startsWith('on')) {
                        const eventName = key.slice(2).toLowerCase();
                        const idx = this.listeners.findIndex((l) => l.eventName === eventName);
                        if (idx !== -1) {
                            this.listeners[idx].unlisten();
                            this.listeners.splice(idx, 1);
                        }
                    } else {
                        // uso do Renderer2 para remover atributos e limpar propriedades
                        this.renderer.removeAttribute(this.el.nativeElement, key);
                        this.renderer.setProperty(this.el.nativeElement, key, null);
                    }
                }
            }

            for (const [key, value] of Object.entries(rest)) {
                if (key.startsWith('on') && typeof value === 'function') {
                    const eventName = key.slice(2).toLowerCase();
                    const existing = this.listeners.find((l) => l.eventName === eventName);
                    
                    // verificação se o handler do evento mudou para recriar o listener
                    if (existing) {
                        if (existing.handler !== value) {
                            existing.unlisten();
                            const unlisten = this.renderer.listen(this.el.nativeElement, eventName, value);
                            existing.handler = value;
                            existing.unlisten = unlisten;
                        }
                    } else {
                        const unlisten = this.renderer.listen(this.el.nativeElement, eventName, value);
                        this.listeners.push({ eventName, handler: value, unlisten });
                    }
                } else if (value === null || value === undefined) {
                    this.renderer.removeAttribute(this.el.nativeElement, key);
                    this.renderer.setProperty(this.el.nativeElement, key, null);
                } else {
                    try {
                        this.renderer.setAttribute(this.el.nativeElement, key, String(value));
                    } catch {
                        // ignore attribute set failures
                    }

                    this.renderer.setProperty(this.el.nativeElement, key, value);
                }
            }

            // atualiza o registro dos últimos atributos processados
            this._lastAttrs = { ...rest };
        });
    }

    ngOnDestroy() {
        this.clearListeners();
    }

    public setAttrs(attrs: { [key: string]: any } | undefined) {
        if (!equals(this._attrs(), attrs)) {
            this._attrs.set(attrs);
        }
    }

    private clearListeners() {
        this.listeners.forEach(({ unlisten }) => unlisten());
        this.listeners = [];
    }
}

@NgModule({
    imports: [Bind],
    exports: [Bind]
})
export class BindModule {}