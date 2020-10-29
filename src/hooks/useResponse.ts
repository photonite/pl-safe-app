import { useState, useEffect, useCallback } from 'react'

export function useResponse<T>(
  callback: () => Promise<T>,
  init: T,
  dependencies: any[] = [],
  onError?: (e: Error) => void
) {
  const [output, setOutput] = useState<T>(init)

  const _callback = useCallback(callback, dependencies)

  useEffect(() => {
    let isNotCancelled = true

    _callback()
      .then((payload) => {
        if (isNotCancelled) {
          setOutput(payload)
        }
      })
      .catch(onError)

    return () => {
      isNotCancelled = false
    }
  }, [_callback, onError])

  const refresh = useCallback(() => {
    _callback()
      .then(setOutput)
      .catch(onError)
  }, [_callback, onError])

  return [output, refresh]
}

export default useResponse
