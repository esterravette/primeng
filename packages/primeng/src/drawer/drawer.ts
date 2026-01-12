import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    ContentChildren,
    ElementRef,
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
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MotionEvent, MotionOptions } from '@primeuix/motion';
import { addClass, appendChild, removeClass, setAttribute } from '@primeuix/utils';
import { PrimeNGConfig, PrimeTemplate, SharedModule } from 'primeng/api';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { Button, ButtonProps } from 'primeng/button';
import { blockBodyScroll, unblockBodyScroll } from 'primeng/dom';
import { FocusTrapModule } from 'primeng/focustrap';
import { TimesIcon } from 'primeng/icons';
import { MotionModule } from 'primeng/motion';
import { Nullable, VoidListener } from 'primeng/ts-helpers';
import { DrawerPassThrough } from 'primeng/types/drawer';
import { ZIndexUtils } from 'primeng/utils';
import { DrawerStyle } from './style/drawerstyle';

const DRAWER_INSTANCE = new InjectionToken<Drawer>('DRAWER_INSTANCE');

// [REFACTOR] Interface para agrupar inputs e reduzir TMI
export interface DrawerConfig {
    appendTo?: HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any;
    motionOptions?: MotionOptions;
    blockScroll?: boolean;
    style?: { [klass: string]: any } | null;
    styleClass?: string;
    ariaCloseLabel?: string;
    autoZIndex?: boolean;
    baseZIndex?: number;
    modal?: boolean;
    closeButtonProps?: ButtonProps;
    dismissible?: boolean;
    showCloseIcon?: boolean; // deprecated
    closeOnEscape?: boolean;
    transitionOptions?: string; // deprecated
    position?: 'left' | 'right' | 'bottom' | 'top' | 'full';
    fullScreen?: boolean;
    header?: string;
    maskStyle?: { [klass: string]: any } | null;
    closable?: boolean;
}

/**
 * Sidebar is a panel component displayed as an overlay at the edges of the screen.
 * @group Components
 */
@Component({
    selector: 'p-drawer',
    standalone: true,
    imports: [CommonModule, Button, TimesIcon, SharedModule, Bind, FocusTrapModule, MotionModule],
    providers: [DrawerStyle, { provide: DRAWER_INSTANCE, useExisting: Drawer }, { provide: PARENT_INSTANCE, useExisting: Drawer }],
    hostDirectives: [Bind],
    template: `
        @if (modalVisible) {
            <div
                #container
                [pBind]="ptm('root')"
                [pMotion]="visible"
                [pMotionAppear]="true"
                [pMotionEnterActiveClass]="$enterAnimation()"
                [pMotionLeaveActiveClass]="$leaveAnimation()"
                [pMotionOptions]="computedMotionOptions()"
                (pMotionOnBeforeEnter)="onBeforeEnter($event)"
                (pMotionOnAfterLeave)="onAfterLeave($event)"
                [class]="cn(cx('root'), config.styleClass)"
                [style]="config.style"
                role="complementary"
                (keydown)="onKeyDown($event)"
                pFocusTrap
                [attr.data-p]="dataP"
                [attr.data-p-open]="visible"
            >
                @if (headlessTemplate || _headlessTemplate) {
                    <ng-container *ngTemplateOutlet="headlessTemplate || _headlessTemplate"></ng-container>
                } @else {
                    <div [pBind]="ptm('header')" [ngClass]="cx('header')" [attr.data-pc-section]="'header'">
                        <ng-container *ngTemplateOutlet="headerTemplate || _headerTemplate"></ng-container>
                        <div *ngIf="config.header" [pBind]="ptm('title')" [class]="cx('title')">{{ config.header }}</div>
                        <p-button
                            *ngIf="showCloseIcon && closable"
                            [pt]="ptm('pcCloseButton')"
                            [ngClass]="cx('pcCloseButton')"
                            (onClick)="close($event)"
                            (keydown.enter)="close($event)"
                            [buttonProps]="closeButtonProps"
                            [ariaLabel]="config.ariaCloseLabel"
                            [attr.data-pc-group-section]="'iconcontainer'"
                            [unstyled]="unstyled()"
                        >
                            <ng-template #icon>
                                <svg data-p-icon="times" *ngIf="!closeIconTemplate && !_closeIconTemplate" [attr.data-pc-section]="'closeicon'" />
                                <ng-template *ngTemplateOutlet="closeIconTemplate || _closeIconTemplate"></ng-template>
                            </ng-template>
                        </p-button>
                    </div>

                    <div [pBind]="ptm('content')" [ngClass]="cx('content')" [attr.data-pc-section]="'content'">
                        <ng-content></ng-content>
                        <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate"></ng-container>
                    </div>

                    <ng-container *ngIf="footerTemplate || _footerTemplate">
                        <div [pBind]="ptm('footer')" [ngClass]="cx('footer')" [attr.data-pc-section]="'footer'">
                            <ng-container *ngTemplateOutlet="footerTemplate || _footerTemplate"></ng-container>
                        </div>
                    </ng-container>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class Drawer extends BaseComponent<DrawerPassThrough> {
    $pcDrawer: Drawer | undefined = inject(DRAWER_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    // [REFACTOR] Explicit injection
    _primeConfig = inject(PrimeNGConfig);

    // [REFACTOR] Config input to group properties
    @Input() config: DrawerConfig = {};

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    // [REFACTOR] Removed individual inputs (appendTo, motionOptions, blockScroll, style, styleClass, etc.)
    // Created getters for properties with default values or logic

    get appendTo() { return this.config.appendTo; }
    get position() { return this.config.position || 'left'; }
    get fullScreen() { return this.config.fullScreen === true; }
    get modal() { return this.config.modal !== false; } // default true
    get closeOnEscape() { return this.config.closeOnEscape !== false; } // default true
    get dismissible() { return this.config.dismissible !== false; } // default true
    get closable() { return this.config.closable !== false; } // default true
    get showCloseIcon() { return this.config.showCloseIcon !== false; } // default true
    get blockScroll() { return this.config.blockScroll === true; }
    get autoZIndex() { return this.config.autoZIndex !== false; } // default true
    get baseZIndex() { return this.config.baseZIndex || 0; }
    
    get closeButtonProps() { 
        return this.config.closeButtonProps || { severity: 'secondary', text: true, rounded: true }; 
    }

    $appendTo = computed(() => this.appendTo || this._primeConfig.overlayAppendTo());

    computedMotionOptions = computed<MotionOptions>(() => {
        return {
            ...this.ptm('motion'),
            ...this.config.motionOptions
        };
    });

    /**
     * The visible property is an input that determines the visibility of the component.
     * @defaultValue false
     * @group Props
     */
    @Input() get visible(): boolean {
        return this._visible ?? false;
    }
    set visible(value: boolean) {
        this._visible = value;

        if (this._visible && !this.modalVisible) {
            this.modalVisible = true;
        }
    }

    // [REFACTOR] Animation computed properties updated to use config getters
    $enterAnimation = computed(() => (this.fullScreen ? 'p-drawer-enter-full' : `p-drawer-enter-${this.position}`));

    $leaveAnimation = computed(() => (this.fullScreen ? 'p-drawer-leave-full' : `p-drawer-leave-${this.position}`));

    /**
     * Callback to invoke when dialog is shown.
     * @group Emits
     */
    @Output() onShow: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when dialog is hidden.
     * @group Emits
     */
    @Output() onHide: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when dialog visibility is changed.
     * @param {boolean} value - Visible value.
     * @group Emits
     */
    @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('container') containerViewChild: ElementRef | undefined;

    @ViewChild('closeButton') closeButtonViewChild: ElementRef | undefined;

    initialized: boolean | undefined;

    _visible: boolean | undefined;

    modalVisible: boolean = false;

    container: Nullable<HTMLDivElement>;

    mask: Nullable<HTMLDivElement>;

    maskClickListener: VoidListener;

    documentEscapeListener: VoidListener;

    animationEndListener: VoidListener;

    _componentStyle = inject(DrawerStyle);

    onAfterViewInit() {
        this.initialized = true;
    }
    /**
     * Custom header template.
     * @group Templates
     */
    @ContentChild('header', { descendants: false }) headerTemplate: TemplateRef<void> | undefined;
    /**
     * Custom footer template.
     * @group Templates
     */
    @ContentChild('footer', { descendants: false }) footerTemplate: TemplateRef<void> | undefined;
    /**
     * Custom content template.
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: TemplateRef<void> | undefined;
    /**
     * Custom close icon template.
     * @group Templates
     */
    @ContentChild('closeicon', { descendants: false }) closeIconTemplate: TemplateRef<void> | undefined;
    /**
     * Custom headless template to replace the entire drawer content.
     * @group Templates
     */
    @ContentChild('headless', { descendants: false }) headlessTemplate: TemplateRef<void> | undefined;

    _headerTemplate: TemplateRef<void> | undefined;

    _footerTemplate: TemplateRef<void> | undefined;

    _contentTemplate: TemplateRef<void> | undefined;

    _closeIconTemplate: TemplateRef<void> | undefined;

    _headlessTemplate: TemplateRef<void> | undefined;

    @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate> | undefined;

    onAfterContentInit() {
        this.templates?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;
                case 'header':
                    this._headerTemplate = item.template;
                    break;
                case 'footer':
                    this._footerTemplate = item.template;
                    break;
                case 'closeicon':
                    this._closeIconTemplate = item.template;
                    break;
                case 'headless':
                    this._headlessTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.hide(false);
        }
    }

    show() {
        this.container?.setAttribute(this.$attrSelector, '');

        if (this.autoZIndex) {
            ZIndexUtils.set('modal', this.container, this.baseZIndex || this._primeConfig.zIndex.modal);
        }

        if (this.modal) {
            this.enableModality();
        }

        this.onShow.emit({});
        this.visibleChange.emit(true);
    }

    hide(emit: boolean = true) {
        if (emit) {
            this.onHide.emit({});
        }

        if (this.modal) {
            this.disableModality();
        }
    }

    close(event: Event) {
        this.hide();
        this.visibleChange.emit(false);
        event.preventDefault();
    }

    enableModality() {
        const activeDrawers = this.document.querySelectorAll('[data-p-open="true"]');
        const activeDrawersLength = activeDrawers.length;
        const zIndex = activeDrawersLength == 1 ? String(parseInt((this.container as HTMLDivElement).style.zIndex) - 1) : String(parseInt((activeDrawers[activeDrawersLength - 1] as HTMLElement).style.zIndex) - 1);

        if (!this.mask) {
            this.mask = this.renderer.createElement('div');

            if (this.mask) {
                const style = `z-index: ${zIndex};${this.getMaskStyle()}`;
                setAttribute(this.mask, 'style', style);
                setAttribute(this.mask, 'data-p', this.dataP);
                addClass(this.mask, this.cx('mask'));
            }

            if (this.dismissible) {
                this.maskClickListener = this.renderer.listen(this.mask, 'click', (event: any) => {
                    if (this.dismissible) {
                        this.close(event);
                    }
                });
            }

            this.renderer.appendChild(this.document.body, this.mask);
            if (this.blockScroll) {
                blockBodyScroll();
            }
        }
    }

    getMaskStyle() {
        return this.config.maskStyle
            ? Object.entries(this.config.maskStyle)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('; ')
            : '';
    }

    disableModality() {
        if (this.mask) {
            !this.$unstyled() && removeClass(this.mask, 'p-overlay-mask-enter-active');
            !this.$unstyled() && addClass(this.mask, 'p-overlay-mask-leave-active');
            this.animationEndListener = this.renderer.listen(this.mask, 'animationend', this.destroyModal.bind(this));
        }
    }

    destroyModal() {
        this.unbindMaskClickListener();

        if (this.mask) {
            this.renderer.removeChild(this.document.body, this.mask);
        }

        if (this.blockScroll) {
            unblockBodyScroll();
        }

        this.unbindAnimationEndListener();
        this.mask = null;
    }

    onBeforeEnter(event: MotionEvent) {
        this.container = event.element as HTMLDivElement;
        this.appendContainer();
        this.show();

        if (this.closeOnEscape) {
            this.bindDocumentEscapeListener();
        }
    }

    onAfterLeave() {
        this.hide(false);
        ZIndexUtils.clear(this.container);
        this.unbindGlobalListeners();
        this.modalVisible = false;
        this.container = null;
    }

    appendContainer() {
        if (this.$appendTo() && this.$appendTo() !== 'self') {
            if (this.$appendTo() === 'body') {
                appendChild(this.document.body, this.container!);
            } else {
                appendChild(this.$appendTo(), this.container!);
            }
        }
    }

    bindDocumentEscapeListener() {
        const documentTarget: any = this.el ? this.el.nativeElement.ownerDocument : this.document;

        this.documentEscapeListener = this.renderer.listen(documentTarget, 'keydown', (event) => {
            if (event.which == 27) {
                if (parseInt((this.container as HTMLDivElement)?.style.zIndex) === ZIndexUtils.get(this.container)) {
                    this.close(event);
                }
            }
        });
    }

    unbindDocumentEscapeListener() {
        if (this.documentEscapeListener) {
            this.documentEscapeListener();
            this.documentEscapeListener = null;
        }
    }

    unbindMaskClickListener() {
        if (this.maskClickListener) {
            this.maskClickListener();
            this.maskClickListener = null;
        }
    }

    unbindGlobalListeners() {
        this.unbindMaskClickListener();
        this.unbindDocumentEscapeListener();
    }

    unbindAnimationEndListener() {
        if (this.animationEndListener && this.mask) {
            this.animationEndListener();
            this.animationEndListener = null;
        }
    }

    onDestroy() {
        this.initialized = false;

        if (this.visible && this.modal) {
            this.destroyModal();
        }

        if (this.$appendTo() && this.container) {
            this.renderer.appendChild(this.el.nativeElement, this.container);
        }

        if (this.container && this.autoZIndex) {
            ZIndexUtils.clear(this.container);
        }

        this.container = null;
        this.unbindGlobalListeners();
        this.unbindAnimationEndListener();
    }

    get dataP() {
        return this.cn({
            'full-screen': this.position === 'full',
            [this.position]: this.position,
            open: this.visible,
            modal: this.modal
        });
    }
}

@NgModule({
    imports: [Drawer, SharedModule],
    exports: [Drawer, SharedModule]
})
export class DrawerModule {}