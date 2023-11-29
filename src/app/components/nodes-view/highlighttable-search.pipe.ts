import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightSearch'
})
export class HighlightSearchPipe implements PipeTransform {

  transform(value: string, search: string): string {
    const valueStr = String(value); // Ensure numeric values are converted to strings
    // (?![^&;]+;) - to ensure that there are no HTML entities (such as &amp; or &lt;) 
    //               ex. value = "&lt;span&gt;" search = "span", The word 'span' will not be included in the matches
    // (?!<[^<>]*) - to ensure that there are no HTML tags (<...>)
    //               ex. value = "<span>" search = "span", The word 'span' will not be included in the matches
    return valueStr.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + search + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<strong>$1</strong>');
  }

}