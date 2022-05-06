

export function saveAccess(type: string, token: string){
  sessionStorage.setItem('access', JSON.stringify({ token, type }));
}

export function getAccess(){
  const access = sessionStorage.getItem('access') || '{}';
  const access_data = JSON.parse(access)
  return access_data
}
