import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, inject, InjectionToken, Input, input, NgModule, ViewEncapsulation } from '@angular/core';
import { cn, getKeyValue, mergeProps, resolve, toFlatCase } from '@primeuix/utils';
import { Bind, BindModule } from 'primeng/bind';
import { IconFieldPassThrough } from 'primeng/types/iconfield';
import { IconFieldStyle } from './style/iconfieldstyle';

const ICONFIELD_INSTANCE = new InjectionToken<IconField>('ICONFIELD_INSTANCE');

/**
 * IconField wraps an input and an icon.
 * @group Components
 */
@Component({
    selector: 'p-iconfield, p-iconField, p-icon-field',
    standalone: true,
    imports: [CommonModule, BindModule],
    template: ` <ng-content></ng-content>`,
    providers: [IconFieldStyle, { provide: ICONFIELD_INSTANCE, useExisting: IconField }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class]': 'hostClasses'
    },
    hostDirectives: [Bind]
})
export class IconField implements AfterViewChecked {
    // composição
    private readonly componentStyle = inject(IconFieldStyle);

    @Input() hostName: string | undefined = '';

    _componentStyle = inject(IconFieldStyle);

    $pcIconField: IconField | undefined = inject(ICONFIELD_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    // inputs que antes eram herdados de BaseComponent
    pt = input<IconFieldPassThrough>();
    unstyled = input<boolean>(false);

    ngAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Position of the icon.
     * @group Props
     */
    @Input() iconPosition: 'right' | 'left' = 'left';
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;

    cx(key: string, params: Record<string, unknown> = {}) {
        if (this.unstyled()) return undefined;
        const classes = getKeyValue(this.componentStyle.classes, key, params);
        return cn(classes);
    }

    get hostClasses(): string {
        const rootClasses = this.cx('root');
        return cn(rootClasses, this.styleClass) ?? '';
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
}

@NgModule({
    imports: [IconField],
    exports: [IconField]
})
export class IconFieldModule {}
