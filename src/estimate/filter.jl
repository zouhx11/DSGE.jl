"""
```
filter(m, data, system, s_0 = [], P_0 = []; cond_type = :none,
    include_presample = true, in_sample = true,
    outputs = [:loglh, :pred, :filt])
```

Computes and returns the filtered values of states for the state-space
system corresponding to the current parameter values of model `m`.

### Inputs

- `m::AbstractModel`: model object
- `data`: `DataFrame` or `nobs` x `hist_periods` `Matrix{S}` of data for
  observables. This should include the conditional period if `cond_type in
  [:semi, :full]`
- `system::System`: `System` object specifying state-space system matrices for
  the model
- `s_0::Vector{S}`: optional `Nz` x 1 initial state vector
- `P_0::Matrix{S}`: optional `Nz` x `Nz` initial state covariance matrix

where `S<:AbstractFloat`.

### Keyword Arguments

- `cond_type::Symbol`: conditional case. See `forecast_all` for documentation of
  all `cond_type` options
- `include_presample::Bool`: indicates whether to include presample periods in
  the returned vector of `Kalman` objects
- `in_sample::Bool`: indicates whether or not to discard out of sample rows in `df_to_matrix` call
- `outputs::Vector{Symbol}`: which Kalman filter outputs to compute and return.
  See `?kalman_filter`

### Outputs

- `kal::Kalman`: see `?Kalman`
"""
function filter(m::AbstractModel, df::DataFrame, system::System{S},
    s_0::Vector{S} = Vector{S}(), P_0::Matrix{S} = Matrix{S}(0, 0);
    cond_type::Symbol = :none, include_presample::Bool = true, in_sample::Bool = true,
    outputs::Vector{Symbol} = [:loglh, :pred, :filt]) where {S<:AbstractFloat}

    data = df_to_matrix(m, df; cond_type = cond_type, in_sample = in_sample)
    start_date = max(date_presample_start(m), df[1, :date])
    filter(m, data, system, s_0, P_0; start_date = start_date,
           include_presample = include_presample, outputs = outputs)
end

function filter(m::AbstractModel, data::Matrix{S}, system::System,
    s_0::Vector{S} = Vector{S}(0), P_0::Matrix{S} = Matrix{S}(0, 0);
    start_date::Date = date_presample_start(m), include_presample::Bool = true,
    outputs::Vector{Symbol} = [:loglh, :pred, :filt]) where {S<:AbstractFloat}

    # Partition sample into pre- and post-ZLB regimes
    # Note that the post-ZLB regime may be empty if we do not impose the ZLB
    regime_inds = zlb_regime_indices(m, data, start_date)

    # Get system matrices for each regime
    TTTs, RRRs, CCCs, QQs, ZZs, DDs, EEs = zlb_regime_matrices(m, system, start_date)

    # If s_0 and P_0 provided, check that rows and columns corresponding to
    # anticipated shocks are zero in P_0
    if !isempty(s_0) && !isempty(P_0)
        ant_state_inds = setdiff(1:n_states_augmented(m), inds_states_no_ant(m))
        @assert all(x -> x == 0, P_0[:, ant_state_inds])
        @assert all(x -> x == 0, P_0[ant_state_inds, :])
    end

    # Specify number of presample periods if we don't want to include them in
    # the final results
    Nt0 = include_presample ? 0 : n_presample_periods(m)

    # Run Kalman filter, construct Kalman object, and return
    out = kalman_filter(regime_inds, data, TTTs, RRRs, CCCs, QQs,
                        ZZs, DDs, EEs, s_0, P_0; outputs = outputs, Nt0 = Nt0)

    return Kalman(out...)
end
