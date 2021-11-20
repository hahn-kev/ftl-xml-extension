import {
    CancellationToken,
    Color,
    ColorInformation,
    ColorPresentation,
    DocumentColorProvider,
    Range,
    TextDocument,
    TextEdit
} from 'vscode';
import {FtlParser} from '../ftl-parser';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from '../models/ftl-file';
import {FtlColor} from '../models/ftl-color';
import {normalizeAttributeName, toRange} from '../helpers';
import {FtlXmlParser} from '../parsers/ftl-xml-parser';

export class FtlColorProvider implements DocumentColorProvider, FtlXmlParser {
    constructor(private ftlParser: FtlParser) {
    }

    provideColorPresentations(color: Color,
                              context: { document: TextDocument; range: Range },
                              token: CancellationToken): ColorPresentation[] {
        let red = this.to255Color(color.red);
        let green = this.to255Color(color.green);
        let blue = this.to255Color(color.blue);
        let newColorText = `r="${red}" g="${green}" b="${blue}" a="${this.roundTo10ths(color.alpha)}"`;
        let colorPresentation = new ColorPresentation(newColorText);
        colorPresentation.textEdit = new TextEdit(context.range, newColorText);
        return [colorPresentation];
    }

    async provideDocumentColors(document: TextDocument, token: CancellationToken): Promise<ColorInformation[] | undefined> {
        console.log('provide document colors');
        let files = await this.ftlParser.files;
        let ftlFile = files.get(document.uri.toString());
        if (!ftlFile) return;
        return ftlFile.colors.filter((c): c is ({ r: number; g: number; b: number } & FtlColor) => c.isValid())
            .map(ftlColor => {
                return new ColorInformation(ftlColor.range,
                    new Color(this.toPercentColor(ftlColor.r),
                        this.toPercentColor(ftlColor.g),
                        this.toPercentColor(ftlColor.b),
                        ftlColor.a ?? 0));
            });
    }

    parseNode(node: Node, file: FtlFile, document: TextDocument): void {
        if (node.tag !== 'color' || !node.attributes) return;
        file.colors.push(new FtlColor(
            toRange('<color '.length + node.start, node.end - '/>'.length, document),
            this.parseAttrIntSafe(node.attributes.r),
            this.parseAttrIntSafe(node.attributes.g),
            this.parseAttrIntSafe(node.attributes.b),
            node.attributes.a ? parseFloat(normalizeAttributeName(node.attributes.a)!) : undefined
        ));
    }

    parseAttrIntSafe(value: string | null) {
        return value ? parseInt(normalizeAttributeName(value)!) : undefined;
    }

    to255Color(n: number) {
        return Math.round(n * 255);
    }

    toPercentColor(n: number) {
        return n / 255;
    }

    roundTo10ths(n: number) {
        return Math.round(n * 10) / 10.0
    }
}
