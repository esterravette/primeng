import { isPlatformBrowser } from '@angular/common';
import { Directive, effect, inject, NgModule, NgZone } from '@angular/core';
import { addClass, getHeight, getOffset, getOuterHeight, getOuterWidth, getWidth, removeClass, remove as utils_remove } from '@primeuix/utils';
import { BaseComponent } from 'primeng/basecomponent';
import { VoidListener } from 'primeng/ts-helpers';
import { RippleStyle } from './style/ripplestyle';

/**
 * Ripple directive adds ripple effect to the host element.
 * @group Components
 */
@Directive({
    selector: '[pRipple]',
    host: {
        class: 'p-ripple'
    },
    standalone: true,
    providers: [RippleStyle]
})
export class Ripple extends BaseComponent {
    zone: NgZone = inject(NgZone);

    _componentStyle = inject(RippleStyle);

    animationListener: VoidListener;

    mouseDownListener: VoidListener;

    timeout: any;
    // referência em cache para o elemento ink criado para evitar consultas repetidas ao DOM
    private _ink: any | null = null;

    constructor() {
        super();
        effect(() => {
            if (isPlatformBrowser(this.platformId)) {
                if (this.config.ripple()) {
                    this.zone.runOutsideAngular(() => {
                        this.create();
                        this.mouseDownListener = this.renderer.listen(this.el.nativeElement, 'mousedown', this.onMouseDown.bind(this));
                    });
                } else {
                    this.remove();
                }
            }
        });
    }

    onAfterViewInit() {}

    onMouseDown(event: MouseEvent) {
        let ink = this.getInk();
        if (!ink) {
            return;
        }

        // proteção do getComputedStyle com try/catch para evitar erros em alguns ambientes
        let display: string | undefined;
        try {
            display = this.document.defaultView?.getComputedStyle(ink, null).display;
        } catch {
            display = undefined;
        }
        if (display === 'none') {
            return;
        }

        !this.$unstyled() && removeClass(ink, 'p-ink-active');
        // uso do renderer para atualizações de atributos
        this.renderer.setAttribute(ink, 'data-p-ink-active', 'false');

        if (!getHeight(ink) && !getWidth(ink)) {
            let d = Math.max(getOuterWidth(this.el.nativeElement), getOuterHeight(this.el.nativeElement));
            // uso do renderer para definir estilos em vez de atribuições diretas de estilo
            this.renderer.setStyle(ink, 'height', d + 'px');
            this.renderer.setStyle(ink, 'width', d + 'px');
        }

        let offset = <any>getOffset(this.el.nativeElement);
        const pageYOffset = this.document.defaultView?.pageYOffset ?? this.document.body?.scrollTop ?? 0;
        const pageXOffset = this.document.defaultView?.pageXOffset ?? this.document.body?.scrollLeft ?? 0;
        // uso de pageXOffset/pageYOffset para coordenadas corretas (e evitar acesso direto a body.scrollTop/Left)
        let x = event.pageX - offset.left + pageXOffset - getWidth(ink) / 2;
        let y = event.pageY - offset.top + pageYOffset - getHeight(ink) / 2;

        this.renderer.setStyle(ink, 'top', y + 'px');
        this.renderer.setStyle(ink, 'left', x + 'px');

        !this.$unstyled() && addClass(ink, 'p-ink-active');
        // uso do renderer para definir atributos
        this.renderer.setAttribute(ink, 'data-p-ink-active', 'true');

        this.timeout = setTimeout(() => {
            let ink = this.getInk();
            if (ink) {
                !this.$unstyled() && removeClass(ink, 'p-ink-active');
                // uso do renderer para definir atributos
                this.renderer.setAttribute(ink, 'data-p-ink-active', 'false');
            }
        }, 401);
    }

    getInk() {
        // uso do _ink em cache quando disponível para evitar travessia repetida do DOM
        if (this._ink) {
            try {
                if (this.el.nativeElement.contains(this._ink)) {
                    return this._ink;
                } else {
                    this._ink = null;
                }
            } catch {
                this._ink = null;
            }
        }

        const children = this.el.nativeElement.children;
        for (let i = 0; i < children.length; i++) {
            if (typeof children[i].className === 'string' && children[i].className.indexOf('p-ink') !== -1) {
                this._ink = children[i];
                return children[i];
            }
        }
        return null;
    }

    resetInk() {
        let ink = this.getInk();
        if (ink) {
            !this.$unstyled() && removeClass(ink, 'p-ink-active');
            // uso do renderer para atualização de atributo
            this.renderer.setAttribute(ink, 'data-p-ink-active', 'false');
        }
    }

    onAnimationEnd(event: Event) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (!this.$unstyled()) {
            // uso do renderer para remover classe
            this.renderer.removeClass(event.currentTarget as any, 'p-ink-active');
        }
        // uso do renderer para definir atributo
        this.renderer.setAttribute(event.currentTarget as any, 'data-p-ink-active', 'false');
    }

    create() {
        let ink = this.renderer.createElement('span');
        this.renderer.addClass(ink, 'p-ink');
        this.renderer.appendChild(this.el.nativeElement, ink);
        this.renderer.setAttribute(ink, 'data-p-ink', 'true');
        this.renderer.setAttribute(ink, 'data-p-ink-active', 'false');
        this.renderer.setAttribute(ink, 'aria-hidden', 'true');
        this.renderer.setAttribute(ink, 'role', 'presentation');

        // cache do elemento ink criado para evitar futuras travessias do DOM
        this._ink = ink;

        if (!this.animationListener) {
            this.animationListener = this.renderer.listen(ink, 'animationend', this.onAnimationEnd.bind(this));
        }
    }

    remove() {
        let ink = this.getInk();
        if (ink) {
            this.mouseDownListener && this.mouseDownListener();
            this.animationListener && this.animationListener();
            this.mouseDownListener = null;
            this.animationListener = null;

            utils_remove(ink);
            // limpeza da referência em cache
            this._ink = null;
        }
    }

    onDestroy() {
        if (this.config && this.config.ripple()) {
            this.remove();
        }
        // garantia de que a referência ink em cache seja limpa ao destruir
        this._ink = null;
    }
}

@NgModule({
    imports: [Ripple],
    exports: [Ripple]
})
export class RippleModule {}