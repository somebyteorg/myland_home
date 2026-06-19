let signingIn = false

export function startSignInFlow() {
    if (signingIn || typeof window === 'undefined') {
        return
    }

    signingIn = true
    window.location.assign('/api/sign')
}
