# This code is based on a routine originally copyright Chris Sims.
# See http://sims.princeton.edu/yftp/gensys/
using LinearAlgebra

"""
```
gensys(Γ0, Γ1, c, Ψ, Π)
gensys(Γ0, Γ1, c, Ψ, Π, div)
gensys(F::GeneralizedSchur, c, Ψ, Π)
gensys(F::GeneralizedSchur, c, Ψ, Π, div)
```

Generate state-space solution to canonical-form DSGE model.

System given as
```
Γ0*y(t) = Γ1*y(t-1) + c + Ψ*z(t) + Π*η(t),
```
with z an exogenous variable process and η being endogenously
determined one-step-ahead expectational errors.

Returned system is
```
y(t) = G1*y(t-1) + C + impact*z(t) + ywt*inv(I-fmat*inv(L))*fwt*z(t+1)
```
Returned values are
```
G1, C, impact, fmat, fwt, ywt, gev, eu, loose
```

If `z(t)` is i.i.d., the last term drops out.

If `div` is omitted from argument list, a `div`>1 is calculated.

### Return codes

* `eu[1] = 1` for existence
* `eu[2] = 1` for uniqueness
* `eu[1] = -1` for existence only with not-s.c. z
* `eu = [-2, -2]` for coincident zeros
* `eu = [-3, -3]` if a LAPACKException is thrown while computing the Schur
  decomposition

### Notes

We constrain Julia to use the complex version of the `schurfact` routine regardless of the
types of `Γ0` and `Γ1`, to match the behavior of Matlab.  Matlab always uses the complex version
of the Schur decomposition, even if the inputs are real numbers.
"""
function gensys(Γ0, Γ1, c, Ψ, Π, args...)
    F = try
        schur!(complex(Γ0), complex(Γ1))
    catch ex
        if isa(ex, LAPACKException)
            info("LAPACK exception thrown while computing Schur decomposition of Γ0 and Γ1.")
            eu = [-3, -3]

            G1 = Array{Float64, 2}(0,0)
            C = Array{Float64, 1}(0)
            impact = Array{Float64, 2}(0,0)
            fmat = Array{Complex{Float64}, 2}(0,0)
            fwt = Array{Complex{Float64}, 2}(0,0)
            ywt = Vector{Complex{Float64}}(0)
            gev = Vector{Complex{Float64}}(0)
            loose = Array{Float64, 2}(0,0)

            return G1, C, impact, fmat, fwt, ywt, gev, eu, loose
        else
            rethrow(ex)
        end
    end
    gensys(F, c, Ψ, Π, args...)
end

function gensys(F::GeneralizedSchur, c, Ψ, Π)
    gensys(F, c, Ψ, Π, new_div(F))
end

# Method that does the real work. Work directly on the decomposition F
function gensys(F::GeneralizedSchur, c, Ψ, Π, div)
    eu = [0, 0]
    ϵ = 1e-6  # small number to check convergence
    nunstab = 0
    zxz = 0
    a, b, = F.S, F.T
    n = size(a, 1)

    select = BitArray(undef, n)
    for i in 1:n
        # nunstab is the variable name used by Chris Sims, but it seems
        # that nunstab should actually correspond to the number of stable λs
        # i.e. nunstab += 1/div > abs(a[i,i])/abs(b[i,i]), which is basically
        # 1 - a small number > abs(a[i,i])/abs(b[i,i])
        select[i] = !(abs(b[i, i]) > div * abs(a[i, i]))
        if (abs(a[i, i]) < ϵ) && (abs(b[i, i]) < ϵ)
            zxz = 1
        end
    end
    nunstab = n - sum(select)

    if zxz == 1
        warn("Coincident zeros. Indeterminacy and/or nonexistence.")
        eu=[-2, -2]

        G1 = Array{Float64, 2}(0, 0)
        C = Array{Float64, 1}(0)
        impact = Array{Float64, 2}(0)
        fmat = Array{Complex{Float64}, 2}(0,0)
        fwt = Array{Complex{Float64}, 2}(0,0)
        ywt = Vector{Complex{Float64}}(0)
        gev = Vector{Complex{Float64}}(0)
        loose = Array{Float64, 2}(0,0)

        return G1, C, impact, fmat, fwt, ywt, gev, eu, loose
    end

    FS = ordschur!(F, select)
    a, b, qt, z = FS.S, FS.T, FS.Q, FS.Z
    gev = hcat(diag(a), diag(b))
    qt1 = qt[:, 1:(n - nunstab)]
    qt2 = qt[:, (n - nunstab + 1):n]
    etawt = qt2' * Π
    neta = size(Π, 2)

    # branch below is to handle case of no stable roots, rather than quitting with an error
    # in that case.
    if nunstab == 0
        etawt = zeros(0, neta)
        ueta = zeros(0, 0)
        deta = zeros(0, 0)
        veta = zeros(neta, 0)
        bigev = 0
    else
        etawtsvd = svd!(etawt)
        bigev = findall(etawtsvd.S .> ϵ)
        ueta = etawtsvd.U[:, bigev]
        veta = etawtsvd.V[:, bigev]
        deta = diagm(0 => etawtsvd.S[bigev])
    end

    existence = length(bigev) >= nunstab
    if existence
        eu[1] = 1
    else
        warn("Nonexistence: number of unstable roots exceeds number of jump variables")
    end

    # Note that existence and uniqueness are not just matters of comparing
    # numbers of roots and numbers of endogenous errors.  These counts are
    # reported below because usually they point to the source of the problem.

    # branch below to handle case of no stable roots
    if nunstab == n
        etawt1 = zeros(0, neta)
        bigev = 0
        ueta1 = zeros(0, 0)
        veta1 = zeros(neta, 0)
        deta1 = zeros(0, 0)
    else
        etawt1 = qt1' * Π
        ndeta1 = min(n - nunstab, neta)
        etawt1svd = svd!(etawt1)
        bigev = findall(etawt1svd.S .> ϵ)
        ueta1 = etawt1svd.U[:, bigev]
        veta1 = etawt1svd.V[:, bigev]
        deta1 = diagm(0 => etawt1svd.S[bigev])
    end

    if isempty(veta1)
        unique = true
    else
        loose = veta1 - veta * veta' * veta1
        loosesvd = svd!(loose)
        nloose = sum(abs.(loosesvd.S) .> ϵ * n)
        unique = (nloose == 0)
    end

    if unique
        eu[2] = 1
    else
        warn("Indeterminacy: $(nloose) loose endogeneous error(s)")
    end


    tmat = hcat(Matrix(I, (n - nunstab,n - nunstab)), -(ueta * (deta \ veta') * veta1 * (deta1 * ueta1'))')

    G0 = vcat(tmat * a, hcat(zeros(nunstab, n - nunstab), Matrix(I, (nunstab,nunstab))))
    G1 = vcat(tmat * b, zeros(nunstab, n))

    # G0 is always non-singular because by construction there are no zeros on
    # the diagonal of a(1:n-nunstab,1:n-nunstab), which forms G0's ul corner.
    G0I = inv(G0)
    G1 = G0I * G1
    usix = (n - nunstab + 1):n
    Busix = b[usix,usix]
    Ausix = a[usix,usix]
    C = G0I * vcat(tmat * (qt' * c), (Ausix - Busix) \ (qt2' * c))
    impact = G0I * vcat(tmat * (qt' * Ψ), zeros(nunstab, size(Ψ, 2)))
    fmat = Busix \ Ausix
    fwt = -Busix \ (qt2' * Ψ)
    ywt = G0I[:, usix]

    loose = G0I * vcat(etawt1 * (Matrix(I, (neta,neta)) - (veta * veta')), zeros(nunstab, neta))

    G1 = real(z * (G1 * z'))
    C = real(z * C)
    impact = real(z * impact)
    loose = real(z * loose)

    ywt = z * ywt

    return G1, C, impact, fmat, fwt, ywt, gev, eu, loose
end


function new_div(F::GeneralizedSchur)
    ϵ = 1e-6  # small number to check convergence
    n = size(F.T, 1)
    a, b = F.S, F.T
    div = 1.01
    for i in 1:n
        if abs(a[i, i]) > 0
            divhat = abs(b[i, i]) / abs(a[i, i])
            if 1 + ϵ < divhat && divhat <= div
                div = .5 * (1 + divhat)
            end
        end
    end

    return div
end
