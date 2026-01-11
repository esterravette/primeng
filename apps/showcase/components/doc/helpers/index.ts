import APIDocs from '@/doc/apidoc/index.json';
import ComponentTokens from '@primeuix/themes/tokens';

interface PropInfo {
    name: string;
    type: string;
    description: string;
    deprecated?: boolean;
    optional: boolean;
    readonly: boolean;
    default?: string;
}

interface InterfaceValue {
    name: string;
    description: string;
    props: PropInfo[];
}

interface APIDocEntry {
    //refactor 1: mudança de any para unknown para evitar acessos inseguros.
    components?: Record<string, unknown>;
    interfaces?: {
        description: string;
        values: InterfaceValue[];
    };
    enumerations?: {
        values: Record<string, { members: Array<{ value: string; description: string }> }>;
    };
    style?: {
        //refactor 2: mudança de any para unknown, seguindo o mesmo padrão da primeira.
        components?: Record<string, unknown>;
        classes?: {
            values: Array<{ class: string; description: string }>;
        };
    };
}

interface PTOption {
    value: number;
    label: string;
    options?: PropInfo[];
    description: string;
}

interface StyleOption {
    class: string;
    description: string;
}

interface TokenOption {
    token: string;
    'CSS Variable': string;
    description: string;
}
//refactor 3: substituição de any pela definição explícita das interfaces ComponentTokenEntry e ComponentTokenGroup.
interface ComponentTokenEntry {
    token: string;
    variable: string;
    description: string;
}
interface ComponentTokenGroup {
    tokens: Record<string, ComponentTokenEntry>;
}



export const getPTOptions = (name: string): PTOption[] => {
    const apiDoc = (APIDocs as Record<string, APIDocEntry>)[name.toLowerCase()];
    const interfaceValues = apiDoc.interfaces?.values || [];
    const ptInterface = interfaceValues.find((v) => v.name === `${name}PassThroughOptions` || v.name === `${name}DirectivePassThroughOptions`);
    const optionsInterface = interfaceValues.find((v) => v.name === `${name}PassThroughMethodOptions`);
    const props = ptInterface?.props || [];
    const data: PTOption[] = [];

    for (const [i, prop] of props.entries()) {
        if (optionsInterface) {
            let subCompName: string | undefined;
            let subOptions: InterfaceValue | undefined;
            const hasSubComp = prop.name !== 'hooks' && prop.type.indexOf('TransitionType') === -1 && prop.type.indexOf('<') > -1 && name.toLowerCase() !== prop.type.slice(0, prop.type.indexOf('<')).toLowerCase();

            if (hasSubComp) {
                subCompName = prop.type.slice(0, prop.type.indexOf('<')).replace('PassThroughOptions', '').replace('PassThroughOptionType', '');
                const subApiDoc = (APIDocs as Record<string, APIDocEntry>)[subCompName.toLowerCase()];
                const subInterfaceValues = subApiDoc.interfaces?.values || [];
                subOptions = subInterfaceValues.find((v) => v.name === `${subCompName}PassThroughMethodOptions`);
                const objToReplace = subOptions?.props.find((opt) => opt.name === 'parent');

                if (objToReplace) {
                    objToReplace.type = prop.type;
                }
            }

            if (!prop.deprecated) {
                data.push({
                    value: i + 1,
                    label: prop.name,
                    options: hasSubComp ? subOptions?.props : optionsInterface?.props,
                    description: prop.description
                });
            }
        } else {
            data.push({
                value: i + 1,
                label: prop.name,
                description: prop.description
            });
        }
    }

    return data;
};

export const getStyleOptions = (name: string): StyleOption[] => {
    const styleDoc = (APIDocs as Record<string, APIDocEntry>)[name.toLowerCase() + 'style'];
    const enumValues = styleDoc && styleDoc.enumerations && styleDoc.enumerations.values;
    const { members = [] } = enumValues ? enumValues[`${name}Classes`] || {} : {};
    const data: StyleOption[] = [];

    for (const member of members) {
        const { value, description } = member;

        data.push({
            class: value.replaceAll('"', ''),
            description
        });
    }

    return data;
};

export const getTokenOptions = (name: string): TokenOption[] => {
    const data: TokenOption[] = [];

    //refactor 4: troca de casting any por Record, utilizando as interfaces criadas.
    const components = ComponentTokens as Record<string, ComponentTokenGroup>;
    const component = components[name.toLowerCase()];

    if (!component) {
        return data;
    }
    //refactor 5: remoção do casting any no loop, usando Object.values em um objeto já tipado.
    for (const value of Object.values(component.tokens)) {
        data.push({
            token: value.token,
            'CSS Variable': value.variable,
            description: value.description
        });
    }

    return data;
};

