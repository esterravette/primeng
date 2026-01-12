import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    inject,
    InjectionToken,
    Injector,
    input,
    Input,
    NgModule,
    numberAttribute,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { AutoFocus } from 'primeng/autofocus';
import { Bind, BindModule } from 'primeng/bind';
import { ToggleSwitchChangeEvent, ToggleSwitchHandleTemplateContext } from 'primeng/types/toggleswitch';
import { ToggleSwitchStyle } from './style/toggleswitchstyle';

const TOGGLESWITCH_INSTANCE = new InjectionToken<ToggleSwitch>('TOGGLESWITCH_INSTANCE');

export const TOGGLESWITCH_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleSwitch),
    multi: true
};

/**
 * ToggleSwitch is used to select a boolean value.
 * @group Components
 */
@Component({
    selector: 'p-toggleswitch, p-toggleSwitch, p-toggle-switch',
    standalone: true,
    imports: [CommonModule, AutoFocus, SharedModule, BindModule],
    template: `
        <input
            #input
            [attr.id]="inputId"
            type="checkbox"
            role="switch"
            [class]="cx('input')"
            [checked]="checked()"
            [attr.required]="required() ? '' : undefined"
            [attr.disabled]="$disabled() ? '' : undefined"
            [attr.aria-checked]="checked()"
            [attr.aria-labelledby]="ariaLabelledBy"
            [attr.aria-label]="ariaLabel"
            [attr.name]="name()"
            [attr.tabindex]="tabindex"
            (focus)="onFocus()"
            (blur)="onBlur()"
            [pAutoFocus]="autofocus"
            [pBind]="ptm('input')"
        />
        <div [class]="cx('slider')" [pBind]="ptm('slider')" [attr.data-p]="dataP">
            <div [class]="cx('handle')" [pBind]="ptm('handle')" [attr.data-p]="dataP">
                @if (handleTemplate || _handleTemplate) {
                    <ng-container *ngTemplateOutlet="handleTemplate || _handleTemplate; context: { checked: checked() }" />
                }
            </div>
        </div>
    `,
    providers: [TOGGLESWITCH_VALUE_ACCESSOR, ToggleSwitchStyle, { provide: TOGGLESWITCH_INSTANCE, useExisting: ToggleSwitch }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        // cn(cx('root')...) substituído por getter local hostClasses
        '[class]': 'hostClasses',
        // sx('root') substituído por getter local hostStyle
        '[style]': 'hostStyle',
        '[attr.data-p-checked]': 'checked()',
        '[attr.data-p-disabled]': '$disabled()',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})

// extends BaseEditableHolder removido e implementado interfaces manualmente
export class ToggleSwitch implements ControlValueAccessor, OnInit, AfterContentInit, AfterViewChecked {
    // injeção de dependências herdadas
    private cd = inject(ChangeDetectorRef);
    private injector = inject(Injector);

    $pcToggleSwitch: ToggleSwitch | undefined = inject(TOGGLESWITCH_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    ngAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    @Input({ transform: numberAttribute }) tabindex: number | undefined;
    /**
     * Identifier of the input element.
     * @group Props
     */
    @Input() inputId: string | undefined;
    /**
     * When present, it specifies that the component cannot be edited.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) readonly: boolean | undefined;
    /**
     * Value in checked state.
     * @group Props
     */
    @Input() trueValue: any = true;
    /**
     * Value in unchecked state.
     * @group Props
     */
    @Input() falseValue: any = false;
    /**
     * Used to define a string that autocomplete attribute the current element.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;

    /**
     * Specifies the size of the component.
     * @defaultValue undefined
     * @group Props
     */
    size = input<'large' | 'small' | undefined>();

    // inputs signal para name e required para compatibilidade com template adicionados
    name = input<string>();
    required = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autofocus: boolean | undefined;

    // implementação manual do input disabled
    @Input({ transform: booleanAttribute }) disabled: boolean | undefined;

    /**
     * Callback to invoke when the on value change.
     * @param {ToggleSwitchChangeEvent} event - Custom change event.
     * @group Emits
     */
    @Output() onChange: EventEmitter<ToggleSwitchChangeEvent> = new EventEmitter<ToggleSwitchChangeEvent>();

    @ViewChild('input') inputViewChild!: ElementRef;
    /**
     * Custom handle template.
     * @param {ToggleSwitchHandleTemplateContext} context - handle context.
     * @see {@link ToggleSwitchHandleTemplateContext}
     * @group Templates
     */
    @ContentChild('handle', { descendants: false }) handleTemplate: TemplateRef<ToggleSwitchHandleTemplateContext> | undefined;

    _handleTemplate: TemplateRef<ToggleSwitchHandleTemplateContext> | undefined;

    focused: boolean = false;

    _componentStyle = inject(ToggleSwitchStyle);

    @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

    // propriedades locais para substituir ControlValueAccessor do base
    _value: any;
    onModelChange: Function = () => {};
    onModelTouched: Function = () => {};
    ngControl: NgControl | null = null;

    ngOnInit() {
        try {
            this.ngControl = this.injector.get(NgControl, null);
            if (this.ngControl) {
                this.ngControl.valueAccessor = this;
            }
        } catch (err) {
            // ignore
        }
    }

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent) {
        this.onClick(event);
    }

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'handle':
                    this._handleTemplate = item.template;
                    break;
                default:
                    this._handleTemplate = item.template;
                    break;
            }
        });
    }

    onClick(event: Event) {
        if (!this.$disabled() && !this.readonly) {
            const newValue = this.checked() ? this.falseValue : this.trueValue;
            this.writeValue(newValue);
            this.onModelChange(newValue);

            this.onChange.emit({
                originalEvent: event,
                checked: newValue
            });

            this.inputViewChild.nativeElement.focus();
        }
    }

    onFocus() {
        this.focused = true;
    }

    onBlur() {
        this.focused = false;
        this.onModelTouched();
    }

    checked() {
        return this._value === this.trueValue;
    }

    writeValue(value: any): void {
        this._value = value;
        this.cd.markForCheck();
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val;
        this.cd.markForCheck();
    }

    $disabled() {
        return this.disabled;
    }

    invalid() {
        return this.ngControl ? this.ngControl.invalid && (this.ngControl.dirty || this.ngControl.touched) : false;
    }

    cx(key: string): string {
        const base = 'p-toggleswitch';
        const classes: any = {
            input: `${base}-input`,
            slider: `${base}-slider`,
            handle: `${base}-handle`
        };
        return classes[key] || '';
    }

    get hostClasses(): string {
        const classes = ['p-toggleswitch p-component'];

        if (this.checked()) classes.push('p-toggleswitch-checked');
        if (this.$disabled()) classes.push('p-disabled');
        if (this.size()) classes.push(`p-toggleswitch-${this.size()}`);
        if (this.styleClass) classes.push(this.styleClass);

        return classes.join(' ');
    }

    get hostStyle(): any {
        return null;
    }

    ptm(key: string) {
        return undefined;
    }

    ptms(keys: string[]) {
        return {};
    }

    get dataP() {
        return [this.checked() ? 'checked' : '', this.$disabled() ? 'disabled' : '', this.invalid() ? 'invalid' : ''].filter(Boolean).join(' ');
    }
}

@NgModule({
    imports: [ToggleSwitch, SharedModule],
    exports: [ToggleSwitch, SharedModule]
})
export class ToggleSwitchModule {}
