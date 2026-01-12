import { CommonModule } from '@angular/common';
import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, Directive, ElementRef, inject, InjectionToken, Input, input, NgModule, OnChanges, OnDestroy, Renderer2, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { isNotEmpty, uuid } from '@primeuix/utils';
import { SharedModule } from 'primeng/api';
import { Bind, BindModule } from 'primeng/bind';
import type { BadgePassThrough } from 'primeng/types/badge';
import { BadgeStyle } from './style/badgestyle';

const BADGE_INSTANCE = new InjectionToken<Badge>('BADGE_INSTANCE');
const BADGE_DIRECTIVE_INSTANCE = new InjectionToken<BadgeDirective>('BADGE_DIRECTIVE_INSTANCE');

/**
 * Badge Directive is directive usage of badge component.
 * @group Components
 */
@Directive({
    selector: '[pBadge]',
    providers: [BadgeStyle, { provide: BADGE_DIRECTIVE_INSTANCE, useExisting: BadgeDirective }],
    standalone: true
})
export class BadgeDirective implements OnChanges, AfterViewInit, OnDestroy {
    // injeção explícita de dependências que antes eram herdadas
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);

    $pcBadgeDirective: BadgeDirective | undefined = inject(BADGE_DIRECTIVE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    /**
     * Used to pass attributes to DOM elements inside the Badge component.
     * @defaultValue undefined
     * @deprecated use pBadgePT instead.
     * @group Props
     */
    ptBadgeDirective = input<BadgePassThrough | undefined>();
    /**
     * Used to pass attributes to DOM elements inside the Badge component.
     * @defaultValue undefined
     * @group Props
     */
    pBadgePT = input<BadgePassThrough | undefined>();
    /**
     * Indicates whether the component should be rendered without styles.
     * @defaultValue undefined
     * @group Props
     */
    pBadgeUnstyled = input<boolean | undefined>();
    /**
     * When specified, disables the component.
     * @group Props
     */
    @Input('badgeDisabled') public disabled: boolean;
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     */
    @Input() public badgeSize: 'large' | 'xlarge' | 'small' | null | undefined;
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     * @deprecated use badgeSize instead.
     */
    @Input() public set size(value: 'large' | 'xlarge' | 'small' | null | undefined) {
        this._size = value;
        console.log('size property is deprecated and will removed in v18, use badgeSize instead.');
    }
    get size() {
        return this._size;
    }
    _size: 'large' | 'xlarge' | 'small' | null | undefined;
    /**
     * Severity type of the badge.
     * @group Props
     */
    @Input() severity: 'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast' | null | undefined;
    /**
     * Value to display inside the badge.
     * @group Props
     */
    @Input() public value: string | number;
    /**
     * Inline style of the element.
     * @group Props
     */
    @Input() badgeStyle: { [klass: string]: any } | null | undefined;
    /**
     * Class of the element.
     * @group Props
     */
    @Input() badgeStyleClass: string;

    private id!: string;

    badgeEl: HTMLElement | null;

    _componentStyle = inject(BadgeStyle);

    // lógica de activeElement removida para usar o host nativo padrão

    private get canUpdateBadge(): boolean {
        return isNotEmpty(this.id) && !this.disabled;
    }

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        const { value, size, severity, disabled, badgeStyle, badgeStyleClass } = changes;

        if (disabled) {
            this.toggleDisableState();
        }

        if (!this.canUpdateBadge) {
            return;
        }

        // reorganização para evitar buscas repetitivas no DOM
        if (!this.badgeEl) {
            this.renderBadgeContent();
        } else {
            if (severity) {
                this.updateSeverity(severity.currentValue, severity.previousValue);
            }
            if (size) {
                this.updateSize();
            }
            if (value) {
                this.updateValue();
            }
            if (badgeStyle || badgeStyleClass) {
                this.applyStyles();
            }
        }
    }

    ngAfterViewInit(): void {
        this.id = uuid('pn_id_') + '_badge';
        if (!this.badgeEl) {
            this.renderBadgeContent();
        }
    }

    private updateValue(): void {
        if (!this.badgeEl) return;

        if (this.value != null) {
            // removeClass via Renderer2
            this.renderer.removeClass(this.badgeEl, 'p-badge-dot');

            if (this.value && String(this.value).length === 1) {
                // addClass via Renderer2
                this.renderer.addClass(this.badgeEl, 'p-badge-circle');
            } else {
                this.renderer.removeClass(this.badgeEl, 'p-badge-circle');
            }
        } else {
            this.renderer.addClass(this.badgeEl, 'p-badge-dot');
            this.renderer.removeClass(this.badgeEl, 'p-badge-circle');
        }

        // manipulação segura de texto
        const badgeValue = this.value != null ? String(this.value) : '';
        this.renderer.setProperty(this.badgeEl, 'textContent', badgeValue);
    }

    private updateSize(): void {
        if (!this.badgeEl) return;

        const size = this.badgeSize || this.size;

        if (size) {
            if (size === 'large') {
                this.renderer.addClass(this.badgeEl, 'p-badge-lg');
                this.renderer.removeClass(this.badgeEl, 'p-badge-xl');
            } else if (size === 'xlarge') {
                this.renderer.addClass(this.badgeEl, 'p-badge-xl');
                this.renderer.removeClass(this.badgeEl, 'p-badge-lg');
            }
        } else {
            this.renderer.removeClass(this.badgeEl, 'p-badge-lg');
            this.renderer.removeClass(this.badgeEl, 'p-badge-xl');
        }
    }

    private renderBadgeContent(): void {
        if (this.disabled) return;

        this.badgeEl = this.renderer.createElement('span');
        this.renderer.setAttribute(this.badgeEl, 'id', this.id);

        // criação de elemento via Renderer2
        this.badgeEl = this.renderer.createElement('span');
        this.renderer.setAttribute(this.badgeEl, 'id', this.id);

        // aplica classes iniciais
        const rootClass = this.cx('root');
        if (rootClass) {
            rootClass.split(' ').forEach((c) => this.renderer.addClass(this.badgeEl, c));
        }

        this.updateSeverity(this.severity);
        this.updateSize();
        this.updateValue();
        this.applyStyles();

        // adiciona classe ao host via Renderer2
        this.renderer.addClass(this.el.nativeElement, 'p-overlay-badge');
        // append via Renderer2
        this.renderer.appendChild(this.el.nativeElement, this.badgeEl);
    }

    private applyStyles(): void {
        if (this.badgeEl) {
            if (this.badgeStyle) {
                for (const [key, value] of Object.entries(this.badgeStyle)) {
                    this.renderer.setStyle(this.badgeEl, key, value);
                }
            }
            if (this.badgeStyleClass) {
                this.badgeStyleClass.split(' ').forEach((c) => this.renderer.addClass(this.badgeEl, c));
            }
        }
    }

    private updateSeverity(newSeverity: string | null | undefined, oldSeverity?: string | null): void {
        if (!this.badgeEl) return;

        if (newSeverity) {
            this.renderer.addClass(this.badgeEl, `p-badge-${newSeverity}`);
        }

        if (oldSeverity) {
            this.renderer.removeClass(this.badgeEl, `p-badge-${oldSeverity}`);
        }
    }

    private toggleDisableState(): void {
        if (!this.id) return;
        if (this.disabled) {
            if (this.badgeEl) {
                // remove child via Renderer2 e limpa referência
                this.renderer.removeChild(this.el.nativeElement, this.badgeEl);
                this.badgeEl = null;
            }
        } else {
            if (!this.badgeEl) {
                this.renderBadgeContent();
            }
        }
    }
}

/**
 * Badge is a small status indicator for another element.
 * @group Components
 */
@Component({
    selector: 'p-badge',
    template: `{{ value() }}`,
    standalone: true,
    imports: [CommonModule, SharedModule, BindModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BadgeStyle, { provide: BADGE_INSTANCE, useExisting: Badge }],
    host: {
        // cx() e cn() herdados removidos. lógica movida para getters locais.
        '[class]': 'hostClasses',
        '[style.display]': 'badgeDisabled() ? "none" : null',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Badge {
    $pcBadge: Badge | undefined = inject(BADGE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;
    bindDirectiveInstance = inject(Bind, { self: true });

    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     */
    badgeSize = input<'small' | 'large' | 'xlarge' | null>();
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     */
    size = input<'small' | 'large' | 'xlarge' | null>();
    /**
     * Severity type of the badge.
     * @group Props
     */
    severity = input<'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast' | null>();
    /**
     * Value to display inside the badge.
     * @group Props
     */
    value = input<string | number | null>();
    /**
     * When specified, disables the component.
     * @group Props
     */
    badgeDisabled = input<boolean, boolean>(false, { transform: booleanAttribute });

    _componentStyle = inject(BadgeStyle);

    // getter auxiliar para substituir a lógica herdada de cx('root')
    get hostClasses(): string {
        const classes = ['p-badge', 'p-component'];

        if (this.value() != null && String(this.value()).length === 1) {
            classes.push('p-badge-circle');
        } else if (this.value() == null) {
            classes.push('p-badge-empty');
        }

        if (this.severity()) {
            classes.push(`p-badge-${this.severity()}`);
        }

        if (this.size()) {
            classes.push(`p-badge-${this.size()}`);
        }

        if (this.styleClass()) {
            classes.push(this.styleClass()!);
        }

        return classes.join(' ');
    }

    get dataP() {
        return [this.value() != null && String(this.value()).length === 1 ? 'circle' : '', this.value() == null ? 'empty' : '', this.badgeDisabled() ? 'disabled' : '', this.severity(), this.size()].filter(Boolean).join(' ');
    }
}

@NgModule({
    imports: [Badge, BadgeDirective, SharedModule],
    exports: [Badge, BadgeDirective, SharedModule]
})
export class BadgeModule {}
