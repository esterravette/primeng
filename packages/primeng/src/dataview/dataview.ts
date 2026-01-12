import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, ElementRef, EventEmitter, inject, InjectionToken, Input, NgModule, numberAttribute, Output, SimpleChanges, TemplateRef, ViewEncapsulation } from '@angular/core';
import { resolveFieldData } from '@primeuix/utils';
import { BlockableUI, FilterService, Footer, Header, PrimeNGConfig, SharedModule, TranslationKeys } from 'primeng/api';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { SpinnerIcon } from 'primeng/icons';
import { PaginatorModule } from 'primeng/paginator';
import { Nullable } from 'primeng/ts-helpers';
import {
    DataViewGridTemplateContext,
    DataViewLayoutChangeEvent,
    DataViewLazyLoadEvent,
    DataViewListTemplateContext,
    DataViewPageEvent,
    DataViewPaginatorDropdownItemTemplateContext,
    DataViewPaginatorLeftTemplateContext,
    DataViewPaginatorRightTemplateContext,
    DataViewPaginatorState,
    DataViewPassThrough,
    DataViewSortEvent
} from 'primeng/types/dataview';
import { Subscription } from 'rxjs';
import { DataViewStyle } from './style/dataviewstyle';

const DATAVIEW_INSTANCE = new InjectionToken<DataView>('DATAVIEW_INSTANCE');

// [REFACTOR] Interface para agrupar configurações e reduzir TMI
export interface DataViewConfig {
    paginator?: boolean;
    pageLinks?: number;
    rowsPerPageOptions?: number[] | any[];
    paginatorPosition?: 'top' | 'bottom' | 'both';
    paginatorStyleClass?: string;
    alwaysShowPaginator?: boolean;
    paginatorDropdownAppendTo?: HTMLElement | ElementRef | TemplateRef<any> | string | null | any;
    paginatorDropdownScrollHeight?: string;
    currentPageReportTemplate?: string;
    showCurrentPageReport?: boolean;
    showJumpToPageDropdown?: boolean;
    showFirstLastIcon?: boolean;
    showPageLinks?: boolean;
    lazy?: boolean;
    lazyLoadOnInit?: boolean;
    emptyMessage?: string;
    styleClass?: string;
    gridStyleClass?: string;
    trackBy?: Function;
    filterBy?: string;
    filterLocale?: string;
    loadingIcon?: string;
    layout?: 'list' | 'grid';
}

/**
 * DataView displays data in grid or list layout with pagination and sorting features.
 * @group Components
 */
@Component({
    selector: 'p-dataView, p-dataview, p-data-view',
    standalone: true,
    imports: [CommonModule, PaginatorModule, SpinnerIcon, SharedModule, Bind],
    template: `
        @if (loading) {
            <div [pBind]="ptm('loading')" [class]="cx('loading')">
                <div [pBind]="ptm('loadingOverlay')" [class]="cx('loadingOverlay')">
                    @if (config.loadingIcon) {
                        <i [class]="cn(cx('loadingIcon'), 'pi-spin' + config.loadingIcon)"></i>
                    } @else {
                        <ng-container>
                            <svg [pBind]="ptm('loadingIcon')" data-p-icon="spinner" [spin]="true" [class]="cx('loadingIcon')" />
                            <ng-template *ngTemplateOutlet="loadingicon"></ng-template>
                        </ng-container>
                    }
                </div>
            </div>
        }
        @if (header || headerTemplate) {
            <div [pBind]="ptm('header')" [class]="cx('header')">
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
            </div>
        }
        @if (config.paginator && (paginatorPosition === 'top' || paginatorPosition == 'both')) {
            <p-paginator
                [rows]="rows"
                [first]="first"
                [totalRecords]="totalRecords"
                [pageLinkSize]="pageLinks"
                [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="paginate($event)"
                [rowsPerPageOptions]="config.rowsPerPageOptions"
                [appendTo]="config.paginatorDropdownAppendTo"
                [dropdownScrollHeight]="paginatorDropdownScrollHeight"
                [templateLeft]="paginatorleft"
                [templateRight]="paginatorright"
                [currentPageReportTemplate]="currentPageReportTemplate"
                [showFirstLastIcon]="showFirstLastIcon"
                [dropdownItemTemplate]="paginatordropdownitem"
                [showCurrentPageReport]="config.showCurrentPageReport"
                [showJumpToPageDropdown]="config.showJumpToPageDropdown"
                [showPageLinks]="showPageLinks"
                [styleClass]="cn(cx('pcPaginator', { position: 'top' }), config.paginatorStyleClass)"
                [pt]="ptm('pcPaginator')"
                [unstyled]="unstyled()"
            ></p-paginator>
        }
        <div [pBind]="ptm('content')" [class]="cx('content')">
            @if (layout === 'list') {
                <ng-container
                    *ngTemplateOutlet="
                        listTemplate;
                        context: {
                            $implicit: config.paginator ? (filteredValue || value | slice: (config.lazy ? 0 : first) : (config.lazy ? 0 : first) + rows) : filteredValue || value
                        }
                    "
                ></ng-container>
            }
            @if (layout === 'grid') {
                <ng-container
                    *ngTemplateOutlet="
                        gridTemplate;
                        context: {
                            $implicit: config.paginator ? (filteredValue || value | slice: (config.lazy ? 0 : first) : (config.lazy ? 0 : first) + rows) : filteredValue || value
                        }
                    "
                ></ng-container>
            }
            @if (isEmpty() && !loading) {
                <div [pBind]="ptm('emptyMessage')" [class]="cx('emptyMessage')">
                    <ng-container *ngIf="!emptymessageTemplate; else empty">
                        {{ emptyMessageLabel }}
                    </ng-container>
                    <ng-container #empty *ngTemplateOutlet="emptymessageTemplate"></ng-container>
                </div>
            }
        </div>
        @if (config.paginator && (paginatorPosition === 'bottom' || paginatorPosition == 'both')) {
            <p-paginator
                [rows]="rows"
                [first]="first"
                [totalRecords]="totalRecords"
                [pageLinkSize]="pageLinks"
                [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="paginate($event)"
                [rowsPerPageOptions]="config.rowsPerPageOptions"
                [appendTo]="config.paginatorDropdownAppendTo"
                [dropdownScrollHeight]="paginatorDropdownScrollHeight"
                [templateLeft]="paginatorleft"
                [templateRight]="paginatorright"
                [currentPageReportTemplate]="currentPageReportTemplate"
                [showFirstLastIcon]="showFirstLastIcon"
                [dropdownItemTemplate]="paginatordropdownitem"
                [showCurrentPageReport]="config.showCurrentPageReport"
                [showJumpToPageDropdown]="config.showJumpToPageDropdown"
                [showPageLinks]="showPageLinks"
                [styleClass]="cn(cx('pcPaginator', { position: 'bottom' }), config.paginatorStyleClass)"
                [pt]="ptm('pcPaginator')"
                [unstyled]="unstyled()"
            ></p-paginator>
        }
        @if (footer || footerTemplate) {
            <div [pBind]="ptm('footer')" [class]="cx('footer')">
                <ng-content select="p-footer"></ng-content>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DataViewStyle, { provide: DATAVIEW_INSTANCE, useExisting: DataView }, { provide: PARENT_INSTANCE, useExisting: DataView }],
    host: {
        '[class]': "cn(cx('root'), config.styleClass)"
    },
    hostDirectives: [Bind]
})
export class DataView extends BaseComponent<DataViewPassThrough> implements BlockableUI {
    bindDirectiveInstance = inject(Bind, { self: true });

    $pcDataView: DataView | undefined = inject(DATAVIEW_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    // [REFACTOR] Injeção explicita do serviço de configuração
    _primeConfig = inject(PrimeNGConfig);

    // [REFACTOR] Input unificado para resolver TMI
    @Input() config: DataViewConfig = {};

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // [REFACTOR] Getters para propriedades que têm valores padrão ou precisam de acesso fácil no template
    
    get pageLinks(): number { return this.config.pageLinks ?? 5; }
    get paginatorPosition() { return this.config.paginatorPosition || 'bottom'; }
    get alwaysShowPaginator(): boolean { return this.config.alwaysShowPaginator !== false; } // default true
    get paginatorDropdownScrollHeight(): string { return this.config.paginatorDropdownScrollHeight || '200px'; }
    get currentPageReportTemplate(): string { return this.config.currentPageReportTemplate || '{currentPage} of {totalPages}'; }
    get showFirstLastIcon(): boolean { return this.config.showFirstLastIcon !== false; } // default true
    get showPageLinks(): boolean { return this.config.showPageLinks !== false; } // default true
    get lazyLoadOnInit(): boolean { return this.config.lazyLoadOnInit !== false; } // default true
    get emptyMessage(): string { return this.config.emptyMessage || ''; }
    get gridStyleClass(): string { return this.config.gridStyleClass || ''; }
    get trackBy(): Function { return this.config.trackBy || ((index: number, item: any) => item); }
    get layout() { return this.config.layout || 'list'; }

    /**
     * Number of rows to display per page.
     * @group Props
     */
    @Input({ transform: numberAttribute }) rows: number | undefined;
    /**
     * Number of total records, defaults to length of value when not defined.
     * @group Props
     */
    @Input({ transform: numberAttribute }) totalRecords: number | undefined;
    
    /**
     * Displays a loader to indicate data load is in progress.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) loading: boolean | undefined;
    
    /**
     * Index of the first row to be displayed.
     * @group Props
     */
    @Input({ transform: numberAttribute }) first: number | undefined = 0;
    /**
     * Property name of data to use in sorting by default.
     * @group Props
     */
    @Input() sortField: string | undefined;
    /**
     * Order to sort the data by default.
     * @group Props
     */
    @Input({ transform: numberAttribute }) sortOrder: number | undefined;
    /**
     * An array of objects to display.
     * @group Props
     */
    @Input() value: any[] | undefined;
    
    // [REFACTOR] 'layout' movido para config, mas mantido via getter

    /**
     * Callback to invoke when paging, sorting or filtering happens in lazy mode.
     * @param {DataViewLazyLoadEvent} event - Custom lazy load event.
     * @group Emits
     */
    @Output() onLazyLoad: EventEmitter<DataViewLazyLoadEvent> = new EventEmitter<DataViewLazyLoadEvent>();
    /**
     * Callback to invoke when pagination occurs.
     * @param {DataViewPageEvent} event - Custom page event.
     * @group Emits
     */
    @Output() onPage: EventEmitter<DataViewPageEvent> = new EventEmitter<DataViewPageEvent>();
    /**
     * Callback to invoke when sorting occurs.
     * @param {DataViewSortEvent} event - Custom sort event.
     * @group Emits
     */
    @Output() onSort: EventEmitter<DataViewSortEvent> = new EventEmitter<DataViewSortEvent>();
    /**
     * Callback to invoke when changing layout.
     * @param {DataViewLayoutChangeEvent} event - Custom layout change event.
     * @group Emits
     */
    @Output() onChangeLayout: EventEmitter<DataViewLayoutChangeEvent> = new EventEmitter<DataViewLayoutChangeEvent>();
    
    /**
     * Template for the list layout.
     * @group Templates
     */
    @ContentChild('list') listTemplate: Nullable<TemplateRef<DataViewListTemplateContext>>;
    /**
     * Template for grid layout.
     * @group Templates
     */
    @ContentChild('grid') gridTemplate: TemplateRef<DataViewGridTemplateContext>;
    /**
     * Template for the header section.
     * @group Templates
     */
    @ContentChild('header') headerTemplate: TemplateRef<void>;
    /**
     * Template for the empty message section.
     * @group Templates
     */
    @ContentChild('emptymessage') emptymessageTemplate: TemplateRef<void>;
    /**
     * Template for the footer section.
     * @group Templates
     */
    @ContentChild('footer') footerTemplate: TemplateRef<void>;
    /**
     * Template for the left side of paginator.
     * @group Templates
     */
    @ContentChild('paginatorleft') paginatorleft: TemplateRef<DataViewPaginatorLeftTemplateContext>;
    /**
     * Template for the right side of paginator.
     * @group Templates
     */
    @ContentChild('paginatorright') paginatorright: TemplateRef<DataViewPaginatorRightTemplateContext>;
    /**
     * Template for items in paginator dropdown.
     * @group Templates
     */
    @ContentChild('paginatordropdownitem') paginatordropdownitem: TemplateRef<DataViewPaginatorDropdownItemTemplateContext>;
    /**
     * Template for loading icon.
     * @group Templates
     */
    @ContentChild('loadingicon') loadingicon: TemplateRef<void>;
    /**
     * Template for list icon.
     * @group Templates
     */
    @ContentChild('listicon') listicon: TemplateRef<void>;
    /**
     * Template for grid icon.
     * @group Templates
     */
    @ContentChild('gridicon') gridicon: TemplateRef<void>;

    @ContentChild(Header) header: any;

    @ContentChild(Footer) footer: any;

    _value: Nullable<any[]>;

    filteredValue: Nullable<any[]>;

    filterValue: Nullable<string>;

    initialized: Nullable<boolean>;

    translationSubscription: Nullable<Subscription>;

    _componentStyle = inject(DataViewStyle);

    get emptyMessageLabel(): string {
        return this.emptyMessage || this._primeConfig.getTranslation(TranslationKeys.EMPTY_MESSAGE);
    }

    filterService = inject(FilterService);

    onInit() {
        if (this.config.lazy && this.lazyLoadOnInit) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }

        this.translationSubscription = this._primeConfig.translationObserver.subscribe(() => {
            this.cd.markForCheck();
        });
        this.initialized = true;
    }

    onAfterViewInit() {}

    onChanges(simpleChanges: SimpleChanges) {
        // [REFACTOR] Verificar mudança de layout dentro do objeto config
        if (simpleChanges.config) {
            const prev = simpleChanges.config.previousValue;
            const curr = simpleChanges.config.currentValue;
            if (prev?.layout !== curr?.layout && !simpleChanges.config.firstChange) {
                this.onChangeLayout.emit({ layout: curr.layout });
            }
        }

        if (simpleChanges.value) {
            this._value = simpleChanges.value.currentValue;
            this.updateTotalRecords();

            if (!this.config.lazy && this.hasFilter()) {
                this.filter(this.filterValue as string);
            }
        }

        if (simpleChanges.sortField || simpleChanges.sortOrder) {
            //avoid triggering lazy load prior to lazy initialization at onInit
            if (!this.config.lazy || this.initialized) {
                this.sort();
            }
        }
    }

    updateTotalRecords() {
        this.totalRecords = this.config.lazy ? this.totalRecords : this._value ? this._value.length : 0;
    }

    paginate(event: DataViewPaginatorState) {
        this.first = event.first;
        this.rows = event.rows;

        if (this.config.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }

        this.onPage.emit({
            first: <number>this.first,
            rows: <number>this.rows
        });
    }

    sort() {
        this.first = 0;

        if (this.config.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        } else if (this.value) {
            this.value.sort((data1, data2) => {
                let value1 = resolveFieldData(data1, this.sortField);
                let value2 = resolveFieldData(data2, this.sortField);
                let result: number;

                if (value1 == null && value2 != null) result = -1;
                else if (value1 != null && value2 == null) result = 1;
                else if (value1 == null && value2 == null) result = 0;
                else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
                else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

                return (this.sortOrder as number) * result;
            });

            if (this.hasFilter()) {
                this.filter(this.filterValue as string);
            }
        }

        this.onSort.emit({
            sortField: <string>this.sortField,
            sortOrder: <number>this.sortOrder
        });
    }

    isEmpty() {
        let data = this.filteredValue || this.value;
        return data == null || data.length == 0;
    }

    createLazyLoadMetadata(): DataViewLazyLoadEvent {
        return {
            first: <number>this.first,
            rows: <number>this.rows,
            sortField: <string>this.sortField,
            sortOrder: <number>this.sortOrder
        };
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    filter(filter: string, filterMatchMode: string = 'contains') {
        this.filterValue = filter;

        if (this.value && this.value.length) {
            let searchFields = (this.config.filterBy as string).split(',');
            this.filteredValue = this.filterService.filter(this.value, searchFields, filter, filterMatchMode, this.config.filterLocale);

            if (this.filteredValue.length === this.value.length) {
                this.filteredValue = null;
            }

            if (this.config.paginator) {
                this.first = 0;
                this.totalRecords = this.filteredValue ? this.filteredValue.length : this.value ? this.value.length : 0;
            }

            this.cd.markForCheck();
        }
    }

    hasFilter() {
        return this.filterValue && this.filterValue.trim().length > 0;
    }

    onDestroy() {
        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }
    }
}

@NgModule({
    imports: [DataView, SharedModule],
    exports: [DataView, SharedModule]
})
export class DataViewModule {}