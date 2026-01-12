import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, InjectionToken, Input, NgModule, OnDestroy, ViewChild, ViewEncapsulation, Renderer2, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { TerminalPassThrough } from 'primeng/types/terminal';
import { Subscription } from 'rxjs';
import { TerminalStyle } from './style/terminalstyle';
import { TerminalService } from './terminalservice';

const TERMINAL_INSTANCE = new InjectionToken<Terminal>('TERMINAL_INSTANCE');

/**
 * Terminal is a text based user interface.
 * @group Components
 */
@Component({
    selector: 'p-terminal',
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule, Bind],
    template: `
        <div [class]="cx('welcomeMessage')" [pBind]="ptm('welcomeMessage')" *ngIf="welcomeMessage">{{ welcomeMessage }}</div>
        <div [class]="cx('commandList')" [pBind]="ptm('commandList')">
            <div [class]="cx('command')" [pBind]="ptm('command')" *ngFor="let command of commands">
                <span [class]="cx('promptLabel')" [pBind]="ptm('promptLabel')">{{ prompt }}</span>
                <span [class]="cx('commandValue')" [pBind]="ptm('commandValue')">{{ command.text }}</span>
                <div [class]="cx('commandResponse')" [pBind]="ptm('commandResponse')" [attr.aria-live]="'polite'">{{ command.response }}</div>
            </div>
        </div>
        <div [class]="cx('prompt')" [pBind]="ptm('prompt')">
            <span [class]="cx('promptLabel')" [pBind]="ptm('promptLabel')">{{ prompt }}</span>
            <input #in type="text" [(ngModel)]="command" [class]="cx('promptValue')" [pBind]="ptm('promptValue')" autocomplete="off" (keydown)="handleCommand($event)" autofocus />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [TerminalStyle, { provide: TERMINAL_INSTANCE, useExisting: Terminal }, { provide: PARENT_INSTANCE, useExisting: Terminal }],
    host: {
        '[class]': "cn(cx('root'), styleClass)"
    },
    hostDirectives: [Bind]
})
export class Terminal extends BaseComponent<TerminalPassThrough> implements AfterViewInit, AfterViewChecked, OnDestroy {
    $pcTerminal: Terminal | undefined = inject(TERMINAL_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    /**
     * Initial text to display on terminal.
     * @group Props
     */
    @Input() welcomeMessage: string | undefined;
    /**
     * Prompt text for each command.
     * @group Props
     */
    @Input() prompt: string | undefined;
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;

    commands: any[] = [];

    command!: string;

    // tipagem de container para HTMLElement|null e inicializado como null para segurança contra nulos
    container: HTMLElement | null = null;

    commandProcessed!: boolean;

    subscription: Subscription;

    // injeta Renderer2 e PLATFORM_ID para operações seguras no DOM e verificações de plataforma
    renderer = inject(Renderer2);
    platformId = inject(PLATFORM_ID);

    _componentStyle = inject(TerminalStyle);

    @ViewChild('in') inputRef!: ElementRef<HTMLInputElement>;

    @HostListener('click')
    onHostClick() {
        // protege o foco com verificações de plataforma e nulidade para evitar erros em ambientes que não sejam navegadores
        if (isPlatformBrowser(this.platformId)) {
            const el = this.inputRef?.nativeElement;
            if (el && typeof el.focus === 'function') {
                try {
                    el.focus();
                } catch {
                    // ignore focus failures
                }
            }
        }
    }

    constructor(public terminalService: TerminalService) {
        super();
        this.subscription = terminalService.responseHandler.subscribe((response) => {
            this.commands[this.commands.length - 1].response = response;
            this.commandProcessed = true;
        });
    }

    // torna o foco seguro contra nulos
    focus(element?: HTMLElement | null) {
        if (element && typeof element.focus === 'function') {
            try {
                element.focus();
            } catch {
                // ignore
            }
        }
    }

    onAfterViewInit() {
        // define o elemento host como HTMLElement com segurança contra nulos
        this.container = (this.el.nativeElement as HTMLElement) ?? null;
    }

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));

        if (this.commandProcessed && this.container && isPlatformBrowser(this.platformId)) {
            // usa renderer.setProperty para atualizar scrollTop com segurança e verificar a plataforma
            try {
                this.renderer.setProperty(this.container, 'scrollTop', this.container.scrollHeight);
            } catch {
                // fallback to direct assignment if renderer fails
                try {
                    this.container.scrollTop = this.container.scrollHeight;
                } catch {
                    // ignore
                }
            }

            this.commandProcessed = false;
        }
    }

    @Input()
    set response(value: string) {
        if (value) {
            this.commands[this.commands.length - 1].response = value;
            this.commandProcessed = true;
        }
    }

    handleCommand(event: KeyboardEvent) {
        if (event.keyCode == 13) {
            this.commands.push({ text: this.command });
            this.terminalService.sendCommand(this.command);
            this.command = '';
        }
    }

    focus(element: HTMLElement) {
        element.focus();
    }

    onDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

@NgModule({
    exports: [Terminal, SharedModule],
    imports: [Terminal, SharedModule]
})
export class TerminalModule {}
