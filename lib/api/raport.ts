export function raportKey(raport_ID: string) {
  if (raport_ID) {
    return [
      'raport/getdata',
      {
        raport_ID,
      },
    ];
  }
}
