import { useSnackbar } from 'notistack';

export function useNotify() {
  const { enqueueSnackbar } = useSnackbar();
  return enqueueSnackbar;
}
