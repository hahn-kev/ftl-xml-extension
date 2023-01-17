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
import {FtlColor} from '../models/ftl-color';
import {nodeTagEq, normalizeAttributeName, toRange} from '../helpers';
import {FtlXmlParser, ParseContext} from '../parsers/ftl-xml-parser';
import {VscodeConverter} from '../vscode-converter';
import { FtlOutputChannel } from '../output/ftl-output-channel';

export class FtlColorProvider implements DocumentColorProvider, FtlXmlParser {
  constructor(private ftlParser: FtlParser, private output: FtlOutputChannel) {
  }

  provideColorPresentations(
      color: Color,
      context: { document: TextDocument; range: Range },
      token: CancellationToken): ColorPresentation[] {
    const red = this.to255Color(color.red);
    const green = this.to255Color(color.green);
    const blue = this.to255Color(color.blue);
    const newColorText = `r="${red}" g="${green}" b="${blue}" a="${this.roundTo10ths(color.alpha)}"`;
    const colorPresentation = new ColorPresentation(newColorText);
    colorPresentation.textEdit = new TextEdit(context.range, newColorText);
    return [colorPresentation];
  }

  async provideDocumentColors(
      document: TextDocument,
      token: CancellationToken): Promise<ColorInformation[] | undefined> {
    const files = await this.ftlParser.files;
    this.output.time('provide document colors')
    const ftlFile = files.get(document.uri.toString());
    if (!ftlFile) return;
    const colors = ftlFile.colors.filter((c): c is ({ r: number; g: number; b: number } & FtlColor) => c.isValid())
      .map((ftlColor) => {
        return new ColorInformation(VscodeConverter.toVscodeRange(ftlColor.range),
          new Color(this.toPercentColor(ftlColor.r),
            this.toPercentColor(ftlColor.g),
            this.toPercentColor(ftlColor.b),
            ftlColor.a ?? 0));
      });
    this.output.timeEnd('provide document colors');
    return colors;
  }

  parseNode({node, file, document}: ParseContext): void {
    if (!nodeTagEq(node, 'color') || !node.attributes) return;
    file.colors.push(new FtlColor(
        toRange('<color '.length + node.start, node.end - '/>'.length, document),
        this.parseAttrIntSafe(node.attributes.r),
        this.parseAttrIntSafe(node.attributes.g),
        this.parseAttrIntSafe(node.attributes.b),
        node.attributes.a ? parseFloat(normalizeAttributeName(node.attributes.a)) : undefined
    ));
  }

  parseAttrIntSafe(value: string | null) {
    return value ? parseInt(normalizeAttributeName(value)) : undefined;
  }

  to255Color(n: number) {
    return Math.round(n * 255);
  }

  toPercentColor(n: number) {
    return n / 255;
  }

  roundTo10ths(n: number) {
    return Math.round(n * 10) / 10.0;
  }
}
