import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    contentChild,
    ContentChildren,
    Directive,
    effect,
    EventEmitter,
    inject,
    InjectionToken,
    input,
    Input,
    NgModule,
    numberAttribute,
    Output,
    QueryList,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { addClass, createElement, findSingle, isEmpty } from '@primeuix/utils';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { AutoFocus } from 'primeng/autofocus';
import { BadgeModule } from 'primeng/badge';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { Fluid } from 'primeng/fluid';
import { SpinnerIcon } from 'primeng/icons';
import { Ripple } from 'primeng/ripple';
import type { ButtonIconTemplateContext, ButtonLoadingIconTemplateContext, ButtonPassThrough, ButtonProps, ButtonSeverity } from 'primeng/types/button';
import { ButtonStyle } from './style/buttonstyle';

//definição de interface pra agrupar e diminuir os inputs.
export interface ButtonConfig {
    text?: boolean;
    plain?: boolean;
    raised?: boolean;
    outlined?: boolean;
    rounded?: boolean;
    link?: boolean;
    size?: 'small' | 'large';
    severity?: ButtonSeverity;
    variant?: 'outlined' | 'text';
    iconPos?: ButtonIconPosition;
    loadingIcon?: string;
    type?: string;
    tabindex?: number;
    style?: { [klass: string]: any };
    styleClass?: string;
    badgeClass?: string;
    badgeSeverity?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast';
    ariaLabel?: string;
    autofocus?: boolean;
}

const BUTTON_INSTANCE = new InjectionToken<Button>('BUTTON_INSTANCE');

const BUTTON_DIRECTIVE_INSTANCE = new InjectionToken<ButtonDirective>('BUTTON_DIRECTIVE_INSTANCE');

const BUTTON_LABEL_INSTANCE = new InjectionToken<ButtonLabel>('BUTTON_LABEL_INSTANCE');

const BUTTON_ICON_INSTANCE = new InjectionToken<ButtonIcon>('BUTTON_ICON_INSTANCE');

export type ButtonIconPosition = 'left' | 'right' | 'top' | 'bottom';

const INTERNAL_BUTTON_CLASSES = {
    button: 'p-button',
    component: 'p-component',
    iconOnly: 'p-button-icon-only',
    disabled: 'p-disabled',
    loading: 'p-button-loading',
    labelOnly: 'p-button-loading-label-only'
} as const;

@Directive({
    selector: '[pButtonLabel]',
    providers: [ButtonStyle, { provide: BUTTON_LABEL_INSTANCE, useExisting: ButtonLabel }, { provide: PARENT_INSTANCE, useExisting: ButtonLabel }],
    standalone: true,
    host: {
        '[class.p-button-label]': '!$unstyled() && true'
    },
    hostDirectives: [Bind]
})
export class ButtonLabel extends BaseComponent {
    /**
     * Used to pass attributes to DOM elements inside the pButtonLabel.
     * @defaultValue undefined
     * @deprecated use pButtonLabelPT instead.
     * @group Props
     */
    ptButtonLabel = input<any>();
    /**
     * Used to pass attributes to DOM elements inside the pButtonLabel.
     * @defaultValue undefined
     * @group Props
     */
    pButtonLabelPT = input<any>();
    /**
     * Indicates whether the component should be rendered without styles.
     * @defaultValue undefined
     * @group Props
     */
    pButtonLabelUnstyled = input<boolean | undefined>();

    $pcButtonLabel: ButtonLabel | undefined = inject(BUTTON_LABEL_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    constructor() {
        super();
        effect(() => {
            const pt = this.ptButtonLabel() || this.pButtonLabelPT();
            pt && this.directivePT.set(pt);
        });

        effect(() => {
            this.pButtonLabelUnstyled() && this.directiveUnstyled.set(this.pButtonLabelUnstyled());
        });
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
}

@Directive({
    selector: '[pButtonIcon]',
    providers: [ButtonStyle, { provide: BUTTON_ICON_INSTANCE, useExisting: ButtonIcon }, { provide: PARENT_INSTANCE, useExisting: ButtonIcon }],
    standalone: true,
    host: {
        '[class.p-button-icon]': '!$unstyled() && true'
    },
    hostDirectives: [Bind]
})
export class ButtonIcon extends BaseComponent {
    /**
     * Used to pass attributes to DOM elements inside the pButtonIcon.
     * @defaultValue undefined
     * @deprecated use pButtonIconPT instead.
     * @group Props
     */
    ptButtonIcon = input<any>();
    /**
     * Used to pass attributes to DOM elements inside the pButtonIcon.
     * @defaultValue undefined
     * @group Props
     */
    pButtonIconPT = input<any>();
    /**
     * Indicates whether the component should be rendered without styles.
     * @defaultValue undefined
     * @group Props
     */
    pButtonUnstyled = input<boolean | undefined>();

    $pcButtonIcon: ButtonIcon | undefined = inject(BUTTON_ICON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    constructor() {
        super();
        effect(() => {
            const pt = this.ptButtonIcon() || this.pButtonIconPT();
            pt && this.directivePT.set(pt);
        });

        effect(() => {
            this.pButtonUnstyled() && this.directiveUnstyled.set(this.pButtonUnstyled());
        });
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
}
/**
 * Button directive is an extension to button component.
 * @group Components
 */
@Directive({
    selector: '[pButton]',
    standalone: true,
    providers: [ButtonStyle, { provide: BUTTON_DIRECTIVE_INSTANCE, useExisting: ButtonDirective }, { provide: PARENT_INSTANCE, useExisting: ButtonDirective }],
    host: {
        '[class.p-button-icon-only]': '!$unstyled() && isIconOnly()',
        '[class.p-button-text]': ' !$unstyled() && isTextButton()'
    },
    hostDirectives: [Bind]
})
export class ButtonDirective extends BaseComponent {
    $pcButtonDirective: ButtonDirective | undefined = inject(BUTTON_DIRECTIVE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    _componentStyle = inject(ButtonStyle);

    /**
     * Used to pass attributes to DOM elements inside the Button component.
     * @defaultValue undefined
     * @deprecated use pButtonPT instead.
     * @group Props
     */
    ptButtonDirective = input<ButtonPassThrough>();
    /**
     * Used to pass attributes to DOM elements inside the Button component.
     * @defaultValue undefined
     * @group Props
     */
    pButtonPT = input<ButtonPassThrough>();
    /**
     * Indicates whether the component should be rendered without styles.
     * @defaultValue undefined
     * @group Props
     */
    pButtonUnstyled = input<boolean | undefined>();

    @Input() hostName: any = '';

    //input de config add de acordo com a interface
    @Input() config: ButtonConfig = {};

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    constructor() {
        super();
        effect(() => {
            const pt = this.ptButtonDirective() || this.pButtonPT();
            pt && this.directivePT.set(pt);
        });

        effect(() => {
            this.pButtonUnstyled() && this.directiveUnstyled.set(this.pButtonUnstyled());
        });

        effect(() => {
            const unstyled = this.$unstyled();

            if (this.initialized && unstyled) {
                this.setStyleClass();
            }
        });
    }

    //remoção de inputs
    // They are now accessed via this.config.* in the logic below.

    text: boolean = false;
    plain: boolean = false;
    raised: boolean = false;
    size: 'small' | 'large' | undefined;
    outlined: boolean = false;
    rounded: boolean = false;
    iconPos: ButtonIconPosition = 'left';
    loadingIcon: string | undefined;

    /**
     * Spans 100% width of the container when enabled.
     * @defaultValue undefined
     * @group Props
     */
    fluid = input(undefined, { transform: booleanAttribute });

    private iconSignal = contentChild(ButtonIcon);

    private labelSignal = contentChild(ButtonLabel);

    isIconOnly = computed(() => !!(!this.labelSignal() && this.iconSignal()));

    public _label: string | undefined;

    public _icon: string | undefined;

    public _loading: boolean = false;

    private _severity: ButtonSeverity;

    _buttonProps!: ButtonProps;

    public initialized: boolean | undefined;

    private get htmlElement(): HTMLElement {
        return this.el.nativeElement as HTMLElement;
    }

    private _internalClasses: string[] = Object.values(INTERNAL_BUTTON_CLASSES);

    pcFluid: Fluid | null = inject(Fluid, { optional: true, host: true, skipSelf: true });

    // verificação do config.text 
    isTextButton = computed(() => !!(!this.iconSignal() && this.labelSignal() && (this.config.text || this.text)));

    /**
     * Text of the button.
     * @deprecated use pButtonLabel directive instead.
     * @group Props
     */
    @Input() get label(): string | undefined {
        return this._label as string;
    }

    set label(val: string) {
        this._label = val;

        if (this.initialized) {
            this.updateLabel();
            this.updateIcon();
            this.setStyleClass();
        }
    }

    /**
     * Name of the icon.
     * @deprecated use pButtonIcon directive instead
     * @group Props
     */
    @Input() get icon(): string {
        return this._icon as string;
    }

    set icon(val: string) {
        this._icon = val;

        if (this.initialized) {
            this.updateIcon();
            this.setStyleClass();
        }
    }

    /**
     * Whether the button is in loading state.
     * @group Props
     */
    @Input() get loading(): boolean {
        return this._loading;
    }

    set loading(val: boolean) {
        this._loading = val;

        if (this.initialized) {
            this.updateIcon();
            this.setStyleClass();
        }
    }

    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @deprecated assign props directly to the button element.
     * @group Props
     */
    @Input() get buttonProps(): ButtonProps {
        return this._buttonProps;
    }

    set buttonProps(val: ButtonProps) {
        this._buttonProps = val;

        if (val && typeof val === 'object') {
            //@ts-ignore
            Object.entries(val).forEach(([k, v]) => this[`_${k}`] !== v && (this[`_${k}`] = v));
        }
    }

    /**
     * Defines the style of the button.
     * @group Props
     */
    // remoão input e adição de coondição de this._severity ou this.config.severity;
    get severity(): ButtonSeverity {
        return this._severity || this.config.severity;
    }

    set severity(value: ButtonSeverity) {
        this._severity = value;

        if (this.initialized) {
            this.setStyleClass();
        }
    }

    spinnerIcon = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-icon-spin">
        <g clip-path="url(#clip0_417_21408)">
            <path
                d="M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="clip0_417_21408">
                <rect width="14" height="14" fill="white" />
            </clipPath>
        </defs>
    </svg>`;

    onAfterViewInit() {
        !this.$unstyled() && addClass(this.htmlElement, this.getStyleClass().join(' '));

        if (isPlatformBrowser(this.platformId)) {
            this.createIcon();
            this.createLabel();
            this.initialized = true;
        }
    }

    // atualização de lógica pra verificação de config
    getStyleClass(): string[] {
        const styleClass: string[] = [INTERNAL_BUTTON_CLASSES.button, INTERNAL_BUTTON_CLASSES.component];

        if (this.icon && !this.label && isEmpty(this.htmlElement.textContent)) {
            styleClass.push(INTERNAL_BUTTON_CLASSES.iconOnly);
        }

        if (this.loading) {
            styleClass.push(INTERNAL_BUTTON_CLASSES.disabled, INTERNAL_BUTTON_CLASSES.loading);

            if (!this.icon && this.label) {
                styleClass.push(INTERNAL_BUTTON_CLASSES.labelOnly);
            }

            if (this.icon && !this.label && !isEmpty(this.htmlElement.textContent)) {
                styleClass.push(INTERNAL_BUTTON_CLASSES.iconOnly);
            }
        }

        if (this.config.text || this.text) {
            styleClass.push('p-button-text');
        }

        if (this.severity) {
            styleClass.push(`p-button-${this.severity}`);
        }

        if (this.config.plain || this.plain) {
            styleClass.push('p-button-plain');
        }

        if (this.config.raised || this.raised) {
            styleClass.push('p-button-raised');
        }

        const size = this.config.size || this.size;
        if (size) {
            styleClass.push(`p-button-${size}`);
        }

        if (this.config.outlined || this.outlined) {
            styleClass.push('p-button-outlined');
        }

        if (this.config.rounded || this.rounded) {
            styleClass.push('p-button-rounded');
        }

        if (size === 'small') {
            styleClass.push('p-button-sm');
        }

        if (size === 'large') {
            styleClass.push('p-button-lg');
        }

        if (this.hasFluid) {
            styleClass.push('p-button-fluid');
        }

        return this.$unstyled() ? [] : styleClass;
    }

    get hasFluid() {
        return this.fluid() ?? !!this.pcFluid;
    }

    setStyleClass() {
        const styleClass = this.getStyleClass();
        this.removeExistingSeverityClass();

        this.htmlElement.classList.remove(...this._internalClasses);
        this.htmlElement.classList.add(...styleClass);
    }

    removeExistingSeverityClass() {
        const severityArray = ['success', 'info', 'warn', 'danger', 'help', 'primary', 'secondary', 'contrast'];
        const existingSeverityClass = this.htmlElement.classList.value.split(' ').find((cls) => severityArray.some((severity) => cls === `p-button-${severity}`));

        if (existingSeverityClass) {
            this.htmlElement.classList.remove(existingSeverityClass);
        }
    }

    createLabel() {
        const created = findSingle(this.htmlElement, '[data-pc-section="buttonlabel"]');
        if (!created && this.label) {
            let labelElement = <HTMLElement>createElement('span', { class: this.cx('label'), 'p-bind': this.ptm('buttonlabel'), 'aria-hidden': this.icon && !this.label ? 'true' : null });
            labelElement.appendChild(this.document.createTextNode(this.label));
            this.htmlElement.appendChild(labelElement);
        }
    }

    createIcon() {
        const created = findSingle(this.htmlElement, '[data-pc-section="buttonicon"]');
        if (!created && (this.icon || this.loading)) {
            const iconPos = this.config.iconPos || this.iconPos; //adição de config
            let iconPosClass = this.label && !this.$unstyled() ? 'p-button-icon-' + iconPos : null;
            let iconClass = !this.$unstyled() && this.getIconClass();
            let iconElement: HTMLElement = <HTMLElement>createElement('span', { class: this.cn(this.cx('icon'), iconPosClass, iconClass), 'aria-hidden': 'true', 'p-bind': this.ptm('buttonicon') });

            if (!this.config.loadingIcon && !this.loadingIcon && this.loading) { //adição de config
                iconElement.innerHTML = this.spinnerIcon;
            }

            this.htmlElement.insertBefore(iconElement, this.htmlElement.firstChild);
        }
    }

    updateLabel() {
        let labelElement = findSingle(this.htmlElement, '[data-pc-section="buttonlabel"]');

        if (!this.label) {
            labelElement && this.htmlElement.removeChild(labelElement);
            return;
        }

        labelElement ? (labelElement.textContent = this.label) : this.createLabel();
    }

    updateIcon() {
        let iconElement = findSingle(this.htmlElement, '[data-pc-section="buttonicon"]');
        let labelElement = findSingle(this.htmlElement, '[data-pc-section="buttonlabel"]');
        const loadingIcon = this.config.loadingIcon || this.loadingIcon; //adição de config

        if (this.loading && !loadingIcon && iconElement) {
            iconElement.innerHTML = this.spinnerIcon;
        } else if (iconElement?.innerHTML) {
            iconElement.innerHTML = '';
        }

        if (iconElement && !this.$unstyled()) {
            const iconPos = this.config.iconPos || this.iconPos; //adição de config
            if (iconPos) {
                iconElement.className = 'p-button-icon ' + (labelElement ? 'p-button-icon-' + iconPos : '') + ' ' + this.getIconClass();
            } else {
                iconElement.className = 'p-button-icon ' + this.getIconClass();
            }
        } else {
            this.createIcon();
        }
    }

    getIconClass() {
        const loadingIcon = this.config.loadingIcon || this.loadingIcon; //adição de config
        return this.loading ? 'p-button-loading-icon ' + (loadingIcon ? loadingIcon : 'p-icon') : this.icon || 'p-hidden';
    }

    onDestroy() {
        this.initialized = false;
    }
}
/**
 * Button is an extension to standard button element with icons and theming.
 * @group Components
 */
@Component({
    selector: 'p-button',
    standalone: true,
    imports: [CommonModule, Ripple, AutoFocus, SpinnerIcon, BadgeModule, SharedModule, Bind],
    template: `
        <button
            [attr.type]="config.type || type || buttonProps?.type"
            [attr.aria-label]="config.ariaLabel || ariaLabel || buttonProps?.ariaLabel"
            [ngStyle]="config.style || style || buttonProps?.style"
            [disabled]="disabled || loading || buttonProps?.disabled"
            [class]="cn(cx('root'), config.styleClass || styleClass, buttonProps?.styleClass)"
            (click)="onClick.emit($event)"
            (focus)="onFocus.emit($event)"
            (blur)="onBlur.emit($event)"
            pRipple
            [attr.tabindex]="config.tabindex || tabindex || buttonProps?.tabindex"
            [pAutoFocus]="config.autofocus || autofocus || buttonProps?.autofocus"
            [pBind]="ptm('root')"
            [attr.data-p]="dataP"
            [attr.data-p-disabled]="disabled || loading || buttonProps?.disabled"
            [attr.data-p-severity]="severity || buttonProps?.severity"
        >
        <ng-content></ng-content>
            <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate"></ng-container>
            <ng-container *ngIf="loading || buttonProps?.loading">
                <ng-container *ngIf="!loadingIconTemplate && !_loadingIconTemplate">
                    <span *ngIf="config.loadingIcon || loadingIcon || buttonProps?.loadingIcon" [class]="cn(cx('loadingIcon'), 'pi-spin', config.loadingIcon || loadingIcon || buttonProps?.loadingIcon)" [pBind]="ptm('loadingIcon')" [attr.aria-hidden]="true"></span>
                    <svg data-p-icon="spinner" *ngIf="!(config.loadingIcon || loadingIcon || buttonProps?.loadingIcon)" [class]="cn(cx('loadingIcon'), cx('spinnerIcon'))" [pBind]="ptm('loadingIcon')" [spin]="true" [attr.aria-hidden]="true" />
                </ng-container>
                <ng-template [ngIf]="loadingIconTemplate || _loadingIconTemplate" *ngTemplateOutlet="loadingIconTemplate || _loadingIconTemplate; context: { class: cx('loadingIcon'), pt: ptm('loadingIcon') }"></ng-template>
            </ng-container>
            <ng-container *ngIf="!(loading || buttonProps?.loading)">
                <span *ngIf="(icon || buttonProps?.icon) && !iconTemplate && !_iconTemplate" [class]="cn(cx('icon'), icon || buttonProps?.icon)" [pBind]="ptm('icon')" [attr.data-p]="dataIconP"></span>
                <ng-template [ngIf]="!icon && (iconTemplate || _iconTemplate)" *ngTemplateOutlet="iconTemplate || _iconTemplate; context: { class: cx('icon'), pt: ptm('icon') }"></ng-template>
            </ng-container>
            <span
                [class]="cx('label')"
                [attr.aria-hidden]="(icon || buttonProps?.icon) && !(label || buttonProps?.label)"
                *ngIf="!contentTemplate && !_contentTemplate && (label || buttonProps?.label)"
                [pBind]="ptm('label')"
                [attr.data-p]="dataLabelP"
                >{{ label || buttonProps?.label }}</span
            >
            <p-badge
                *ngIf="!contentTemplate && !_contentTemplate && (badge || buttonProps?.badge)"
                [value]="badge || buttonProps?.badge"
                [severity]="config.badgeSeverity || badgeSeverity || buttonProps?.badgeSeverity"
                [pt]="ptm('pcBadge')"
                [unstyled]="unstyled()"
            ></p-badge>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ButtonStyle, { provide: BUTTON_INSTANCE, useExisting: Button }, { provide: PARENT_INSTANCE, useExisting: Button }],
    hostDirectives: [Bind]
})
export class Button extends BaseComponent<ButtonPassThrough> {
    @Input() hostName: any = '';

    $pcButton: Button | undefined = inject(BUTTON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    _componentStyle = inject(ButtonStyle);

    // adição do input da interface
    @Input() config: ButtonConfig = {};

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    // remoção de inputs.
    type: string = 'button';
    raised: boolean = false;
    rounded: boolean = false;
    text: boolean = false;
    plain: boolean = false;
    outlined: boolean = false;
    link: boolean = false;
    tabindex: number | undefined;
    size: 'small' | 'large' | undefined;
    variant: 'outlined' | 'text' | undefined;
    style: { [klass: string]: any } | null | undefined;
    styleClass: string | undefined;
    badgeClass: string | undefined;
    badgeSeverity: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = 'secondary';
    ariaLabel: string | undefined;
    autofocus: boolean | undefined;
    iconPos: ButtonIconPosition = 'left';
    loadingIcon: string | undefined;

    /**
     * Value of the badge.
     * @group Props
     */
    @Input() badge: string | undefined;

    /**
     * When present, it specifies that the component should be disabled.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) disabled: boolean | undefined;

    /**
     * Name of the icon.
     * @group Props
     */
    @Input() icon: string | undefined;

    /**
     * Text of the button.
     * @group Props
     */
    @Input() label: string | undefined;

    /**
     * Whether the button is in loading state.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) loading: boolean = false;

    /**
     * Defines the style of the button.
     * @group Props
     */
    // remoção dos inputs getter de severity
    get severity(): ButtonSeverity {
        return this._severity || this.config.severity;
    }

    set severity(value: ButtonSeverity) {
        this._severity = value;

        if (this.initialized) {
            this.setStyleClass();
        }
    }

    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    @Input() buttonProps: ButtonProps;

    /**
     * Spans 100% width of the container when enabled.
     * @defaultValue undefined
     * @group Props
     */
    fluid = input(undefined, { transform: booleanAttribute });

    /**
     * Callback to execute when button is clicked.
     * This event is intended to be used with the <p-button> component. Using a regular <button> element, use (click).
     * @param {MouseEvent} event - Mouse event.
     * @group Emits
     */
    @Output() onClick: EventEmitter<MouseEvent> = new EventEmitter();

    /**
     * Callback to execute when button is focused.
     * This event is intended to be used with the <p-button> component. Using a regular <button> element, use (focus).
     * @param {FocusEvent} event - Focus event.
     * @group Emits
     */
    @Output() onFocus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

    /**
     * Callback to execute when button loses focus.
     * This event is intended to be used with the <p-button> component. Using a regular <button> element, use (blur).
     * @param {FocusEvent} event - Focus event.
     * @group Emits
     */
    @Output() onBlur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

    /**
     * Custom content template.
     * @group Templates
     **/
    @ContentChild('content') contentTemplate: TemplateRef<void> | undefined;

    /**
     * Custom loading icon template.
     * @group Templates
     **/
    @ContentChild('loadingicon') loadingIconTemplate: TemplateRef<ButtonLoadingIconTemplateContext> | undefined;

    /**
     * Custom icon template.
     * @group Templates
     **/
    @ContentChild('icon') iconTemplate: TemplateRef<ButtonIconTemplateContext> | undefined;

    @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate> | undefined;

    pcFluid: Fluid | null = inject(Fluid, { optional: true, host: true, skipSelf: true });

    get hasFluid() {
        return this.fluid() ?? !!this.pcFluid;
    }

    get hasIcon() {
        return this.icon || this.buttonProps?.icon || this.iconTemplate || this._iconTemplate || this.loading || this.loadingIconTemplate || this._loadingIconTemplate || this.config.loadingIcon; // [REFACTOR] Added config.loadingIcon check
    }

    _contentTemplate: TemplateRef<void> | undefined;

    _iconTemplate: TemplateRef<ButtonIconTemplateContext> | undefined;

    _loadingIconTemplate: TemplateRef<ButtonLoadingIconTemplateContext> | undefined;

    onAfterContentInit() {
        this.templates?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'icon':
                    this._iconTemplate = item.template;
                    break;

                case 'loadingicon':
                    this._loadingIconTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    //atualização de getters para usar propriedades de configuração
    get dataP() {
        const size = this.config.size || this.size || this.buttonProps?.size;
        return this.cn({
            [size as string]: size,
            'icon-only': this.hasIcon && !this.label && !this.badge,
            loading: this.loading,
            fluid: this.hasFluid,
            rounded: this.config.rounded || this.rounded,
            raised: this.config.raised || this.raised,
            outlined: this.config.outlined || this.outlined || this.config.variant === 'outlined' || this.variant === 'outlined',
            text: this.config.text || this.text || this.config.variant === 'text' || this.variant === 'text',
            link: this.config.link || this.link,
            vertical: ((this.config.iconPos || this.iconPos) === 'top' || (this.config.iconPos || this.iconPos) === 'bottom') && this.label
        });
    }

    get dataIconP() {
        const size = this.config.size || this.size || this.buttonProps?.size;
        return this.cn({
            [this.config.iconPos || this.iconPos]: this.config.iconPos || this.iconPos,
            [size as string]: size
        });
    }

    get dataLabelP() {
        const size = this.config.size || this.size || this.buttonProps?.size;
        return this.cn({
            [size as string]: size,
            'icon-only': this.hasIcon && !this.label && !this.badge
        });
    }
}

@NgModule({
    imports: [CommonModule, ButtonDirective, Button, SharedModule, ButtonLabel, ButtonIcon],
    exports: [ButtonDirective, Button, ButtonLabel, ButtonIcon, SharedModule]
})
export class ButtonModule {}