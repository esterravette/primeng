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
    forwardRef,
    inject,
    InjectionToken,
    input,
    Input,
    NgModule,
    numberAttribute,
    Output,
    QueryList,
    signal,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { contains, equals } from '@primeuix/utils';
import { PrimeNGConfig, PrimeTemplate, SharedModule } from 'primeng/api';
import { PARENT_INSTANCE } from 'primeng/basecomponent';
import { BaseEditableHolder } from 'primeng/baseeditableholder';
import { Bind, BindModule } from 'primeng/bind';
import { CheckIcon } from 'primeng/icons/check';
import { MinusIcon } from 'primeng/icons/minus';
import { Nullable } from 'primeng/ts-helpers';
import { CheckboxChangeEvent, CheckboxIconTemplateContext, CheckboxPassThrough } from 'primeng/types/checkbox';
import { CheckboxStyle } from './style/checkboxstyle';

// refactor: definição de interface pra agrupar e diminuir os inputs.
export interface CheckboxConfig {
    binary?: boolean;
    ariaLabelledBy?: string;
    ariaLabel?: string;
    tabindex?: number;
    inputId?: string;
    inputStyle?: { [klass: string]: any } | null;
    styleClass?: string;
    inputClass?: string;
    indeterminate?: boolean;
    checkboxIcon?: string;
    readonly?: boolean;
    autofocus?: boolean;
    trueValue?: any;
    falseValue?: any;
    variant?: 'filled' | 'outlined';
    size?: 'large' | 'small';
}

const CHECKBOX_INSTANCE = new InjectionToken<Checkbox>('CHECKBOX_INSTANCE');

export const CHECKBOX_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Checkbox),
    multi: true
};
/**
 * Checkbox is an extension to standard checkbox element with theming.
 * @group Components
 */
@Component({
    selector: 'p-checkbox, p-checkBox, p-check-box',
    standalone: true,
    imports: [CommonModule, SharedModule, CheckIcon, MinusIcon, BindModule],
    template: `
        <input
            #input
            [attr.id]="config.inputId"
            type="checkbox"
            [attr.value]="value"
            [attr.name]="name()"
            [checked]="checked"
            [attr.tabindex]="config.tabindex"
            [attr.required]="required() ? '' : undefined"
            [attr.readonly]="config.readonly ? '' : undefined"
            [attr.disabled]="$disabled() ? '' : undefined"
            [attr.aria-labelledby]="config.ariaLabelledBy"
            [attr.aria-label]="config.ariaLabel"
            [style]="config.inputStyle"
            [class]="cn(cx('input'), config.inputClass)"
            [pBind]="ptm('input')"
            (focus)="onInputFocus($event)"
            (blur)="onInputBlur($event)"
            (change)="handleChange($event)"
        />
        <div [class]="cx('box')" [pBind]="ptm('box')" [attr.data-p]="dataP">
            <ng-container *ngIf="!checkboxIconTemplate && !_checkboxIconTemplate">
                <ng-container *ngIf="checked">
                    <span *ngIf="config.checkboxIcon" [class]="cx('icon')" [ngClass]="config.checkboxIcon" [pBind]="ptm('icon')" [attr.data-p]="dataP"></span>
                    <svg data-p-icon="check" *ngIf="!config.checkboxIcon" [class]="cx('icon')" [pBind]="ptm('icon')" [attr.data-p]="dataP" />
                </ng-container>
                <svg data-p-icon="minus" *ngIf="_indeterminate()" [class]="cx('icon')" [pBind]="ptm('icon')" [attr.data-p]="dataP" />
            </ng-container>
            <ng-template *ngTemplateOutlet="checkboxIconTemplate || _checkboxIconTemplate; context: { checked: checked, class: cx('icon'), dataP: dataP }"></ng-template>
        </div>
    `,
    providers: [CHECKBOX_VALUE_ACCESSOR, CheckboxStyle, { provide: CHECKBOX_INSTANCE, useExisting: Checkbox }, { provide: PARENT_INSTANCE, useExisting: Checkbox }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cn(cx('root'), config.styleClass)",
        '[attr.data-p-highlight]': 'checked',
        '[attr.data-p-checked]': 'checked',
        '[attr.data-p-disabled]': '$disabled()',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Checkbox extends BaseEditableHolder<CheckboxPassThrough> {
    @Input() hostName: any = '';
    
    // refactor: input config adicionado para resolver TMI
    @Input() config: CheckboxConfig = {};

    /**
     * Value of the checkbox.
     * @group Props
     */
    @Input() value: any;

    /**
     * Form control value.
     * @group Props
     */
    @Input() formControl: FormControl | undefined;

    // refactor: Inputs removidos (binary, ariaLabelledBy, etc.) e mapeados para config.
    
    /**
     * Callback to invoke on value change.
     * @param {CheckboxChangeEvent} event - Custom value change event.
     * @group Emits
     */
    @Output() onChange: EventEmitter<CheckboxChangeEvent> = new EventEmitter();
    /**
     * Callback to invoke when the receives focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onFocus: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke when the loses focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onBlur: EventEmitter<Event> = new EventEmitter<Event>();

    @ViewChild('input') inputViewChild: Nullable<ElementRef>;

    // refactor: acesso a trueValue via config com fallback
    get trueValue() { return this.config.trueValue !== undefined ? this.config.trueValue : true; }
    get falseValue() { return this.config.falseValue !== undefined ? this.config.falseValue : false; }

    get checked() {
        return this._indeterminate() ? false : this.config.binary ? this.modelValue() === this.trueValue : contains(this.value, this.modelValue());
    }

    _indeterminate = signal<any>(undefined);
    
    /**
     * Custom checkbox icon template.
     * @group Templates
     */
    @ContentChild('icon', { descendants: false }) checkboxIconTemplate: TemplateRef<CheckboxIconTemplateContext> | undefined;

    @ContentChildren(PrimeTemplate) templates: Nullable<QueryList<PrimeTemplate>>;

    _checkboxIconTemplate: TemplateRef<CheckboxIconTemplateContext> | undefined;

    focused: boolean = false;

    _componentStyle = inject(CheckboxStyle);
    
    // refactor: Injeção explicita para evitar conflito com o input 'config'
    _primeConfig = inject(PrimeNGConfig);

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcCheckbox: Checkbox | undefined = inject(CHECKBOX_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    // refactor: computed atualizado para usar config e _primeConfig
    $variant = computed(() => this.config.variant || this._primeConfig.inputStyle() || this._primeConfig.inputVariant());

    onAfterContentInit() {
        this.templates?.forEach((item) => {
            switch (item.getType()) {
                case 'icon':
                    this._checkboxIconTemplate = item.template;
                    break;
                case 'checkboxicon':
                    this._checkboxIconTemplate = item.template;
                    break;
            }
        });
    }

    onChanges(changes: SimpleChanges) {
        // refactor: verificação de mudanças no config para indeterminate
        if (changes.config) {
            const config = changes.config.currentValue;
            if (config && config.indeterminate !== undefined) {
                this._indeterminate.set(config.indeterminate);
            }
        }
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    updateModel(event) {
        let newModelValue;

        const selfControl = this.injector.get<NgControl | null>(NgControl, null, { optional: true, self: true });

        const currentModelValue = selfControl && !this.formControl ? selfControl.value : this.modelValue();

        if (!this.config.binary) {
            if (this.checked || this._indeterminate()) newModelValue = currentModelValue.filter((val) => !equals(val, this.value));
            else newModelValue = currentModelValue ? [...currentModelValue, this.value] : [this.value];

            this.onModelChange(newModelValue);
            this.writeModelValue(newModelValue);

            if (this.formControl) {
                this.formControl.setValue(newModelValue);
            }
        } else {
            newModelValue = this._indeterminate() ? this.trueValue : this.checked ? this.falseValue : this.trueValue;
            this.writeModelValue(newModelValue);
            this.onModelChange(newModelValue);
        }

        if (this._indeterminate()) {
            this._indeterminate.set(false);
        }

        this.onChange.emit({ checked: newModelValue, originalEvent: event });
    }

    handleChange(event) {
        if (!this.config.readonly) {
            this.updateModel(event);
        }
    }

    onInputFocus(event) {
        this.focused = true;
        this.onFocus.emit(event);
    }

    onInputBlur(event) {
        this.focused = false;
        this.onBlur.emit(event);
        this.onModelTouched();
    }

    focus() {
        this.inputViewChild?.nativeElement.focus();
    }

    /**
     * @override
     *
     * @see {@link BaseEditableHolder.writeControlValue}
     * Writes the value to the control.
     */
    writeControlValue(value: any, setModelValue: (value: any) => void): void {
        setModelValue(value);
        this.cd.markForCheck();
    }

    get dataP() {
        return this.cn({
            invalid: this.invalid(),
            checked: this.checked,
            disabled: this.$disabled(),
            filled: this.$variant() === 'filled',
            [this.config.size as string]: this.config.size
        });
    }
}

@NgModule({
    imports: [Checkbox, SharedModule],
    exports: [Checkbox, SharedModule]
})
export class CheckboxModule {}