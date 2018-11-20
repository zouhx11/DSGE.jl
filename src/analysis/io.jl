################################################################
## I/O to create MeansBands objects
################################################################

"""
```
get_meansbands_input_file(m, input_type, cond_type, output_var;
    forecast_string = "", fileformat = :jld)
```

```
get_meansbands_input_file(directory, filestring_base, input_type, cond_type, output_var;
    forecast_string = "", fileformat = :jld)
```

Returns a dictionary of raw forecast output files to read in to compute means
and bands.

### Inputs

**Method 1:**

- `m::AbstractModel`

**Method 2:**

- `directory::String`: directory location of input files to read
- `filestring_base::Vector{String}`: a vector of strings to be added as
  a suffix. These usually come from model settings for which `print = true`. It
  should *not* include entries for `cond_type` and `input_type` (these will be
  added automatically).

**Both methods:**

- `input_type::Symbol`: See `?forecast_one`
- `cond_type::Symbol`: See `?forecast_one`
- `output_var::Symbol`: See `?forecast_one`
- `forecast_string::String`: See `?forecast_one`
- `fileformat`: file extension of saved files
"""
function get_meansbands_input_file(m::AbstractModel, input_type::Symbol,
                                   cond_type::Symbol, output_var::Symbol;
                                   forecast_string::String = "", fileformat = :jld)

    directory = rawpath(m, "forecast")
    base = filestring_base(m)
    get_meansbands_input_file(directory, base, input_type, cond_type, output_var;
                              forecast_string = forecast_string,
                              fileformat = fileformat)
end

function get_meansbands_input_file(directory::String, filestring_base::Vector{String},
                                   input_type::Symbol, cond_type::Symbol, output_var::Symbol;
                                   forecast_string::String = "", fileformat::Symbol = :jld)

    filename = get_forecast_filename(directory, filestring_base,
                                     input_type, cond_type, output_var,
                                     forecast_string = forecast_string,
                                     fileformat = fileformat)
    filename = replace(filename, "hist4q" => "hist")
    filename = replace(filename, "histut" => "hist")
    filename = replace(filename, "forecast4q" => "forecast")
    filename = replace(filename, "forecastut" => "forecast")
    return filename
end


################################################################
## I/O for actual MeansBands objects
################################################################

"""
```
get_meansbands_output_file(m, input_type, cond_type, output_var;
    forecast_string = "", fileformat = :jld)
```

```
get_meansbands_output_file(directory, filestring_base, input_type, cond_type, output_var;
    forecast_string = "", fileformat = :jld)
```

Returns a dictionary of raw forecast output files in which to save
computed means and bands.

### Inputs

**Method 1:**

- `m::AbstractModel`: Model object

**Method 2:**

- `directory::String`: directory location of input files to read
- `filestring_base::Vector{String}`: a vector of strings to be
  added as a suffix. These usually come from model settings for which
  print=true. It should *not* include entries for `cond_type` and
  `input_type` (these will be added automatically).

**Both methods:**

- `input_type::Symbol`: See `?forecast_one`
- `cond_type::Symbol`: See `?forecast_one`
- `output_vars::Symbol`: See `?forecast_one`
- `forecast_string::String`: See `?forecast_one`
- `fileformat`: file extension of saved files
"""
function get_meansbands_output_file(m::AbstractModel, input_type::Symbol,
                                    cond_type::Symbol, output_var::Symbol;
                                    forecast_string::String = "",
                                    fileformat::Symbol = :jld,
                                    directory::String = workpath(m, "forecast"))

    directory = directory
    base = filestring_base(m)
    get_meansbands_output_file(directory, base, input_type, cond_type, output_var;
                               forecast_string = forecast_string, fileformat = fileformat)
end

function get_meansbands_output_file(directory::String,
                                    filestring_base::Vector{String},
                                    input_type::Symbol, cond_type::Symbol, output_var::Symbol;
                                    forecast_string::String = "", fileformat = :jld)

    get_forecast_filename(directory, filestring_base,
                          input_type, cond_type, Symbol("mb", output_var);
                          forecast_string = forecast_string,
                          fileformat = fileformat)
end

"""
```
read_mb(fn::String)

read_mb(m, input_type, cond_type, output_var; forecast_string = "",
    bdd_and_unbdd::Bool = false, directory = workpath(m, \"forecast\"))
```

Read in a `MeansBands` object saved in `fn`, or use the model object `m` to
determine the file location.

If `bdd_and_unbdd`, then `output_var` must be either `:forecast` or
`:forecast4q`. Then this function calls `read_bdd_and_unbdd` to return a
`MeansBands` with unbounded means and bounded bands.
"""
function read_mb(fn::String)
    @assert isfile(fn) "File $fn could not be found"
    jldopen(fn, "r") do f
        read(f, "mb")
    end
end

function read_mb(m::AbstractModel, input_type::Symbol, cond_type::Symbol,
                 output_var::Symbol; forecast_string::String = "",
                 bdd_and_unbdd::Bool = false,
                 directory::String = workpath(m, "forecast"))

    unbdd_file = get_meansbands_output_file(m, input_type, cond_type, output_var;
                                            forecast_string = forecast_string,
                                            directory = directory)

    if bdd_and_unbdd
        @assert get_product(output_var) in [:forecast, :forecast4q]
        bdd_output_var = Symbol(:bdd, output_var)
        bdd_file = get_meansbands_output_file(m, input_type, cond_type, bdd_output_var;
                                              forecast_string = forecast_string,
                                              directory = directory)
        read_bdd_and_unbdd_mb(bdd_file, unbdd_file)
    else
        read_mb(unbdd_file)
    end
end

"""
```
read_bdd_and_unbdd_mb(bdd_fn::String, unbdd_fn::String)
```

Read in the bounded and unbounded forecast `MeansBands` from `bdd_fn` and
`unbdd_fn`. Create and return a `MeansBands` with the unbounded means and
bounded bands.
"""
function read_bdd_and_unbdd_mb(bdd_fn::String, unbdd_fn::String)
    # Check files exist
    @assert isfile(bdd_fn)   "File $bdd_fn could not be found"
    @assert isfile(unbdd_fn) "File $unbdd_fn could not be found"

    # Read MeansBands
    bdd_mb   = read_mb(bdd_fn)
    unbdd_mb = read_mb(unbdd_fn)

    # Check well-formed
    for fld in [:para, :forecast_string, :cond_type, :date_inds, :class, :indices]
        @assert bdd_mb.metadata[fld] == unbdd_mb.metadata[fld] "$fld field does not match: $((bdd_mb.metadata[fld], unbdd_mb.metadata[fld]))"
    end
    @assert (bdd_mb.metadata[:product], unbdd_mb.metadata[:product]) in [(:bddforecast, :forecast), (:bddforecast4q, :forecast4q)] "Invalid product fields: $((bdd_mb.metadata[:product], unbdd_mb.metadata[:product]))"

    # Stick together unbounded means, bounded bands
    return MeansBands(unbdd_mb.metadata, unbdd_mb.means, bdd_mb.bands)
end


################################################################
## I/O for human-readable csvs
################################################################

"""
```
write_meansbands_tables_timeseries(m, input_type, cond_type, output_var;
    forecast_string = "", bdd_and_unbdd = false,
    read_dirname = workpath(m, \"forecast\"),
    write_dirname = tablespath(m, \"forecast\"), kwargs...)

write_meansbands_tables_timeseries(dirname, filestring_base, mb;
    tablevars = get_variables(mb))
```

### Inputs

**Method 1 only:**

- `m::AbstractModel`
- `input_type::Symbol`
- `cond_type::Symbol`
- `output_var::Symbol`: `class(output_var)` must be one of `[:hist, :histut, :hist4q, :forecast, :forecastut, :forecast4q, :bddforecast, :bddforecastut, :bddforecast4q, :trend, :dettrend, :histforecast, :histforecastut, :histforecast4q]`
- `read_dirname::String`: directory to which meansbands objects are read from

**Method 2 only:**

- `read_dirname::String`: directory from which `MeansBands` are read in
- `write_dirname::String`: directory to which tables are saved
- `filestring_base::Vector{String}`: the result of `filestring_base(m)`,
  typically `[\"vint=yymmdd\"]``

### Keyword Arguments

- `tablevars::Vector{Symbol}`: which series to write tables for

**Method 1 only:**

- `forecast_string::String`
- `bdd_and_unbdd::Bool`: whether to use unbounded means and bounded
  bands. Applies only for `class(output_var) in [:forecast, :forecast4q]`
- `dirname::String`: directory to which tables are saved
"""
function write_meansbands_tables_timeseries(m::AbstractModel, input_type::Symbol,
                                            cond_type::Symbol, output_var::Symbol;
                                            forecast_string::String = "",
                                            bdd_and_unbdd::Bool = false,
                                            read_dirname::String = workpath(m, "forecast"),
                                            write_dirname::String = tablespath(m, "forecast"),
                                            kwargs...)
    # Check that output_var is a time series
    prod = get_product(output_var)
    @assert prod in [:hist, :histut, :hist4q, :forecast, :forecastut, :forecast4q,
                     :bddforecast, :bddforecastut, :bddforecast4q,
                     :histforecast, :histforecastut, :histforecast4q,
                     :trend, :dettrend]

    # Read in MeansBands
    class = get_class(output_var)

    if prod in [:histforecast, :histforecastut, :histforecast4q]
        if prod == :histforecastut
            hist_prod  = :histut
            fcast_prod = :forecastut
        elseif prod == :histforecast4q
            hist_prod  = :hist4q
            fcast_prod = :forecast4q
        else
            hist_prod  = :hist
            fcast_prod = :forecast
        end

        mb_hist  = read_mb(m, input_type, cond_type, Symbol(hist_prod, class),
                           forecast_string = forecast_string, directory = read_dirname)
        mb_fcast = read_mb(m, input_type, cond_type, Symbol(fcast_prod, class),
                           forecast_string = forecast_string, bdd_and_unbdd = bdd_and_unbdd,
                           directory = read_dirname)
        mb = cat(mb_hist, mb_fcast)
    else
        mb = read_mb(m, input_type, cond_type, output_var, forecast_string = forecast_string,
                     bdd_and_unbdd = bdd_and_unbdd, directory = read_dirname)
    end

    # Call second method
    write_meansbands_tables_timeseries(write_dirname, filestring_base(m), mb;
                                       kwargs...)
end

function write_meansbands_tables_timeseries(dirname::String, filestring_base::Vector{String},
                                            mb::MeansBands;
                                            tablevars::Vector{Symbol} = Symbol[],
                                            bands_pcts::Vector{String} = which_density_bands(mb, uniquify = true))
    for tablevar in tablevars
        df = prepare_meansbands_table_timeseries(mb, tablevar, bands_pcts = bands_pcts)
                                                 # shocks = columnvars)
        write_meansbands_table(dirname, filestring_base, mb, df, tablevar)
    end
end

"""
```
write_means_tables_shockdec(m, input_type, cond_type, class;
    forecast_string = "", dirname = tablespath(m, \"forecast\"),
    kwargs...)

write_means_tables_shockdec(dirname, filestring_base, mb_shockdec,
    mb_trend, mb_dettrend, mb_hist, mb_forecast; tablevars = get_variables(mb),
    columnvars = get_shocks(mb), groups = [])
```

### Inputs

**Method 1 only:**

- `m::AbstractModel`
- `input_type::Symbol`
- `cond_type::Symbol`
- `class::Symbol`

**Method 2 only:**

- `dirname::String`: directory to which tables are saved
- `filestring_base::Vector{String}`: the result of `filestring_base(m)`,
  typically `[\"vint=yymmdd\"]``
- `mb_shockdec::MeansBands`
- `mb_trend::MeansBands`
- `mb_dettrend::MeansBands`
- `mb_hist::MeansBands`: optional
- `mb_forecast::MeansBands`: optional

### Keyword Arguments

- `tablevars::Vector{Symbol}`: which series to write tables for
- `columnvars::Vector{Symbol}`: which shocks to include as columns in the tables
- `groups::Vector{ShockGroup}`: if provided, shocks will be grouped accordingly

**Method 1 only:**

- `forecast_string::String`
- `bdd_and_unbdd::Bool`: whether to use unbounded means and bounded
  bands. Applies only for `class(output_var) in [:forecast, :forecast4q]`
- `read_dirname::String`: directory from which `MeansBands` are read in
- `write_dirname::String`: directory to which tables are saved
"""
function write_means_tables_shockdec(m::AbstractModel, input_type::Symbol,
                                     cond_type::Symbol, class::Symbol;
                                     forecast_string::String = "",
                                     read_dirname::String = workpath(m, "forecast"),
                                     write_dirname::String = tablespath(m, "forecast"),
                                     kwargs...)
    # Read in necessary MeansBands
    products = [:shockdec, :trend, :dettrend, :hist, :forecast]
    output_vars = [Symbol(product, class) for product in products]
    mbs = OrderedDict{Symbol, MeansBands}()
    for output_var in output_vars
        try
            mbs[output_var] = read_mb(m, input_type, cond_type, output_var,
                                      forecast_string = forecast_string, directory = read_dirname)
        catch ex
            if output_var in [Symbol(:hist, class), Symbol(:forecast, class)]
                warn("MeansBands for " * string(output_var) * " not found")
                mbs[output_var] = MeansBands()
            else
                rethrow(ex)
            end
        end
    end

    # Call second method
    write_means_tables_shockdec(write_dirname, filestring_base(m), values(mbs)...;
                                kwargs...)
end

function write_means_tables_shockdec(write_dirname::String, filestring_base::Vector{String},
                                     mb_shockdec::MeansBands, mb_trend::MeansBands,
                                     mb_dettrend::MeansBands,
                                     mb_hist::MeansBands = MeansBands(),
                                     mb_forecast::MeansBands = MeansBands();
                                     tablevars::Vector{Symbol} = get_variables(mb_shockdec),
                                     columnvars::Vector{Symbol} = get_shocks(mb_shockdec),
                                     groups::Vector{ShockGroup} = ShockGroup[])

    # If shockdec tables are written as part of write_meansbands_tables_all then
    # the default kwargs passed into write_means_tables_shockdec for vars and shocks are empty Symbol vectors
    # Hence, to ensure both user flexibility at the top-level with being able to specify vars/shocks from
    # write_meansbands_tables_all and also to ensure that non-trivial shockdecs are returned (that is shockdecs with
    # actual shocks in them as opposed to just the dettrend), this is the additional check in place.
    tablevars = isempty(tablevars) ? get_variables(mb_shockdec) : tablevars
    columnvars = isempty(columnvars) ? get_shocks(mb_shockdec) : columnvars

    for tablevar in tablevars
        df = prepare_means_table_shockdec(mb_shockdec, mb_trend, mb_dettrend, tablevar,
                                          mb_forecast = mb_forecast, mb_hist = mb_hist,
                                          shocks = columnvars,
                                          groups = groups)
        write_meansbands_table(write_dirname, filestring_base, mb_shockdec, df, tablevar)
    end
end

"""
```
write_meansbands_tables_irf(m, input_type, cond_type, class;
    forecast_string = "", dirname = tablespath(m, \"forecast\"),
    kwargs...)

write_meansbands_tables_irf(dirname, filestring_base, mb;
    tablevars = get_shocks(mb), columnvars = get_variables(mb))
```

### Inputs

**Method 1 only:**

- `m::AbstractModel`
- `input_type::Symbol`
- `cond_type::Symbol`
- `class::Symbol`

**Method 2 only:**

- `dirname::String`: directory to which tables are saved
- `filestring_base::Vector{String}`: the result of `filestring_base(m)`,
  typically `[\"vint=yymmdd\"]``
- `mb::MeansBands`

### Keyword Arguments

- `tablevars::Vector{Symbol}`: which shocks to write tables for
- `columnvars::Vector{Symbol}`: which series' impulse responses to include as
  columns in the tables

**Method 1 only:**

- `forecast_string::String`
- `bdd_and_unbdd::Bool`: whether to use unbounded means and bounded
  bands. Applies only for `class(output_var) in [:forecast, :forecast4q]`
- `dirname::String`: directory to which tables are saved
"""
function write_meansbands_tables_irf(m::AbstractModel, input_type::Symbol,
                                     cond_type::Symbol, class::Symbol;
                                     forecast_string::String = "",
                                     write_dirname::String = tablespath(m, "forecast"),
                                     kwargs...)
    output_var = Symbol(:irf, class)

    # Read in MeansBands
    mb = read_mb(m, input_type, cond_type, output_var, forecast_string = forecast_string)

    # Call second method
    write_meansbands_tables_irf(write_dirname, filestring_base(m), mbs...;
                                kwargs...)
end

function write_meansbands_tables_irf(dirname::String, filestring_base::Vector{String},
                                     mb::MeansBands,
                                     tablevars::Vector{Symbol} = get_shocks(mb),
                                     columnvars::Vector{Symbol} = get_variables(mb))
    for tablevar in tablevars
        df = prepare_meansbands_table_irf(mb, tablevar, columnvars)
        write_meansbands_table(dirname, filestring_base, mb, df, tablevar)
    end
end

"""
```
write_meansbands_table(dirname, filestring_base, mb, df, tablevar)
```

### Inputs

- `dirname::String`: directory to which tables are saved. Defaults to
  `tablespath(m, \"forecast\")`
- `filestring_base::Vector{String}`: the result of `filestring_base(m)`,
  typically `[\"vint=yymmdd\"]``
- `mb::MeansBands`: used for computing the output file name
- `df::DataFrame`: the result of calling one of
  `prepare_meansbands_table_timeseries`, `prepare_means_table_shockdec`, or
  `prepare_means_table, irf`
- `tablevar::Symbol`: used for computing the base output file name
"""
function write_meansbands_table(dirname::String, filestring_base::Vector{String},
                                mb::MeansBands, df::DataFrame, tablevar::Symbol)
    # Extract metadata
    prod = get_product(mb)
    para = get_para(mb)
    cond = get_cond_type(mb)
    forecast_string = mb.metadata[:forecast_string]

    # Compute output file name
    filename = detexify(string(prod) * "_" * string(tablevar) * ".csv")
    filestring_addl = get_forecast_filestring_addl(para, cond, forecast_string = forecast_string)
    fullfilename = savepath(dirname, filename, filestring_base, filestring_addl)

    # Write to file
    CSV.write(fullfilename, df)
    println(" * Wrote means and bands for $tablevar to $fullfilename")
end

"""
```
write_meansbands_tables_all(m, input_type, cond_type, output_vars;
    forecast_string = "", dirname = tablespath(m, \"forecast\"),
    vars = [], shocks = [], shock_groups = [])
```

Write all `output_vars` corresponding to model `m` to tables in `dirname`.

### Inputs

- `m::AbstractModel`
- `input_type::Symbol`: See `?forecast_one`
- `cond_type::Symbol`: See `?forecast_one`
- `output_vars::Symbol`: See `?forecast_one`

### Keyword Arguments

- `forecast_string::String`: See `?forecast_one`
- `vars`::Vector{Symbol}: Vector of economic variables for which to
  print `output_vars` to tables. If omitted, all shocks will be
  printed.
- `shocks::Vector{Symbol}`: Vector of shocks to print if `output_vars`
  contains a shock decomposition. If omitted, all shocks will be
  printed.
- `shock_groups::Vector{ShockGroup}`: if provided, shocks will be grouped
  accordingly in shockdec tables
"""
function write_meansbands_tables_all(m::AbstractModel, input_type::Symbol, cond_type::Symbol,
                                     output_vars::Vector{Symbol};
                                     forecast_string = "",
                                     write_dirname::String = tablespath(m, "forecast"),
                                     vars::Vector{Symbol} = Symbol[],
                                     shocks::Vector{Symbol} = Symbol[],
                                     shock_groups::Vector{ShockGroup} = ShockGroup[])
    for output_var in output_vars

        class = get_class(output_var)
        prod  = get_product(output_var)

        if prod in [:hist, :histut, :hist4q, :forecast, :forecastut, :forecast4q,
                    :histforecast, :histforecastut, :histforecast4q,
                    :bddforecast, :bddforecastut, :bddforecast4q,
                    :trend, :dettrend]
            write_meansbands_tables_timeseries(m, input_type, cond_type, output_var,
                                              tablevars = vars,
                                              forecast_string = forecast_string,
                                              write_dirname = write_dirname)

        elseif prod == :shockdec
            write_means_tables_shockdec(m, input_type, cond_type, class,
                                        tablevars = vars, columnvars = shocks,
                                        forecast_string = forecast_string,
                                        write_dirname = write_dirname,
                                        groups = shock_groups)

        elseif prod == :irf
            write_means_tables(m, input_type, cond_type, class,
                               tablevars = shocks, columnvars = vars,
                               forecast_string = forecast_string,
                               write_dirname = write_dirname)
        end
    end
end
