import json2csv from 'json2csv';

function getRow(row, columns) {
  let obj = {}
  columns.forEach(col => {
    let val = row[col.prop];
    val = !val ? '' : val.toString();
    if (col.formatter) {
      val = col.formatter(row, col, val);
      val = !val ? '' : val.toString();
    }
    obj[col.prop] = val;
  })
  return obj
}

export default function ExportCsv(data, columns, fileName) {
  //导出的数据行
  const rows = data.map(t => getRow(t, columns))
  //导出的数据列标题
  const fields = columns.map(t => {
    return {
      value: t.prop,
      label: t.label
    }
  });

  try {
    const result = json2csv.parse(rows, {
      fields: fields,
      excelStrings: true
    });
    const link = document.createElement('a');
    const blob = new Blob(["\ufeff" + result], {type: 'text/csv'});
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link); // Required for FF
  } catch (err) {
    console.log(err);
  }
}
