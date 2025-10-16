export const parseRedirect = (search: string) => {
  if (!search) {
    return "/";
  }

  const params = new URLSearchParams(search);
  const redirect = params.get("redirect");

  if (!redirect || !redirect.startsWith("/")) {
    return "/";
  }

  return redirect;
};
