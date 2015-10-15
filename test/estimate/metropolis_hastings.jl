using Base.Test, HDF5, DSGE, Debug
include("../util.jl")

# Set up model for testing
m = Model990()
m.reoptimize = false
m.recalculate_hessian = false
m.num_mh_blocks_test = 1
m.num_mh_simulations_test = 100
m.num_mh_burn_test = 0
m.mh_thinning_step = 1

# Read in the covariance matrix for Metropolis-Hastings and reference parameter draws
reference_fn  = joinpath(dirname(@__FILE__), "metropolis_hastings.h5")
h5_ref        = h5open(reference_fn, "r")
propdist_cov  = read(h5_ref, "propdist_cov")
ref_draws     = read(h5_ref, "parasim")
ref_cov       = read(h5_ref, "param_covariance")
close(h5_ref)

# Set up and run metropolis-hastings
estimate(m, verbose=:none, testing=true, proposal_covariance = propdist_cov)


# Read in the parameter draws from estimate()
h5_fn        = joinpath(outpath(m), "sim_save.h5")
h5           = h5open(h5_fn, "r")
test_draws   = read(h5, "parasim")
test_cov     = read(h5, "param_covariance")
close(h5)

test_cov2 = cov(test_draws)

# Test that the parameter draws are equal
@test test_matrix_eq(ref_draws, test_draws, ε=1e-9, noisy=true)


# Test that the covariance matrices are equal
test_matrix_eq(ref_cov, test_cov2, ε=1e-9, noisy=true)

# Remove the file generated by the test
#rm(h5_fn)
