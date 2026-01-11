import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, inject, InjectionToken, Input, input, NgModule, ViewEncapsulation } from '@angular/core';
import { cn, getKeyValue, mergeProps, resolve, toFlatCase } from '@primeuix/utils';
import { SharedModule } from 'primeng/api';
import { Bind, BindModule } from 'primeng/bind';
import { DividerPassThrough } from 'primeng/types/divider';
import { DividerStyle } from './style/dividerstyle';

const DIVIDER_INSTANCE = new InjectionToken<Divider>('DIVIDER_INSTANCE');

/**
 * Divider is used to separate contents.
 * @group Components
 */
@Component({
    selector: 'p-divider',
    standalone: true,
    imports: [CommonModule, SharedModule, BindModule],
    template: `
        <div [pBind]="ptm('content')" [class]="cx('content')">
            <ng-content></ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.aria-orientation]': 'layout',
        role: 'separator',
        '[class]': 'hostClasses',
        '[style]': "sx('root')",
        '[attr.data-p]': 'dataP'
    },
    providers: [DividerStyle, { provide: DIVIDER_INSTANCE, useExisting: Divider }],
    hostDirectives: [Bind]
})

export class Divider implements AfterViewChecked {
    // injeção direta do estilo
    private readonly componentStyle = inject(DividerStyle);

    $pcDivider: Divider | undefined = inject(DIVIDER_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    // inputs anteriormente herdados de BaseComponent
    pt = input<DividerPassThrough>();
    unstyled = input<boolean>(false);
    dt = input<object>();

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
     * Specifies the orientation.
     * @group Props
     */
    @Input() layout: 'horizontal' | 'vertical' | undefined = 'horizontal';
    /**
     * Border style type.
     * @group Props
     */
    @Input() type: 'solid' | 'dashed' | 'dotted' | undefined = 'solid';
    /**
     * Alignment of the content.
     * @group Props
     */
    @Input() align: 'left' | 'center' | 'right' | 'top' | 'bottom' | undefined;

    _componentStyle = inject(DividerStyle);

    cx(key: string, params: Record<string, unknown> = {}) {
        if (this.unstyled()) return undefined;
        const classes = getKeyValue(this.componentStyle.classes, key, params);
        return cn(classes);
    }

    get hostClasses(): string {
        const rootClasses = this.cx('root');
        return cn(rootClasses, this.styleClass) ?? '';
    }

    sx(key: string, params: Record<string, unknown> = {}) {
        if (this.unstyled()) return undefined;
        const inlineStyles = (this.componentStyle as { inlineStyles?: Record<string, unknown> }).inlineStyles;
        if (inlineStyles) {
            return getKeyValue(inlineStyles, key, params);
        }
        return undefined;
    }

    ptm(key: string, params: Record<string, unknown> = {}) {
        const ptConfig = (this.pt() || {}) as Record<string, unknown>;
        return this.getPTValue(ptConfig, key, params);
    }

    ptms(keys: string[], params: Record<string, unknown> = {}) {
        return keys.reduce(
            (acc, arg) => {
                const merged = mergeProps(acc, this.ptm(arg, params));
                return (merged || {}) as Record<string, unknown>;
            },
            {} as Record<string, unknown>
        ); 
    }

    private getPTValue(obj: Record<string, unknown>, key: string, params: Record<string, unknown>) {
        const datasetPrefix = 'data-pc-';
        const self = resolve(getKeyValue(obj, key), params);
        const datasets = key !== 'transition' && {
            [`${datasetPrefix}section`]: toFlatCase(key)
        };
        return mergeProps(self, datasets);
    }

    get dataP() {
        return cn({
            [this.align as string]: this.align,
            [this.layout as string]: this.layout,
            [this.type as string]: this.type
        });
    }
}

@NgModule({
    imports: [Divider, BindModule],
    exports: [Divider, BindModule]
})
export class DividerModule {}