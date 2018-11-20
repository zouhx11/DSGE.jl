"""
`prev_quarter(q::TimeType = now())`

Returns Date identifying last day of the previous quarter
"""
function prev_quarter(q::TimeType = now())
    Date(lastdayofquarter(firstdayofquarter(q)-Dates.Day(1)))
end

"""
`next_quarter(q::TimeType = now())`

Returns Date identifying last day of the next quarter
"""
function next_quarter(q::TimeType = now())
    Date(lastdayofquarter(lastdayofquarter(q)+Dates.Day(1)))
end

"""
`get_quarter_ends(start_date::Date,end_date::Date)`

Returns a DataArray of quarter end dates between `start_date` and `end_date`.
"""
function get_quarter_ends(start_date::Date,end_date::Date)
    map(lastdayofquarter, collect(start_date:Dates.Month(3):end_date))
end

"""
`quartertodate(string::String)`

Convert `string` in the form "YYqX", "YYYYqX", or "YYYY-qX" to a Date of the end of
the indicated quarter. "X" is in `{1,2,3,4}` and the case of "q" is ignored.
"""
function quartertodate(string::String)
    if occursin(r"^[0-9]{2}[qQ][1-4]$", string)
        year = "20"*string[1:2]
        quarter = string[end]
    elseif occursin(r"^[0-9]{4}[qQ][1-4]$", string)
        year = string[1:4]
        quarter = string[end]
    elseif occursin(r"^[0-9]{4}-[qQ][1-4]$", string)
        year = string[1:4]
        quarter = string[end]
    else
        throw(ParseError("Invalid format: $string"))
    end

    year = parse(Int, year)
    quarter = parse(Int, quarter)
    month = 3*quarter
    day = 1

    return lastdayofquarter(Date(year, month, day))
end

"""
`datetoquarter(date::Date)`

Convert `string` in the form "YYqX", "YYYYqX", or "YYYY-qX" to a Date of the end of
the indicated quarter. "X" is in `{1,2,3,4}` and the case of "q" is ignored.

Return an integer from the set `{1,2,3,4}`, corresponding to one of the quarters in a year given a Date object.
"""
function datetoquarter(date::Date)
    month = Dates.month(date)
    if month in 1:3
        return 1
    elseif month in 4:6
        return 2
    elseif month in 7:9
        return 3
    elseif month in 10:12
        return 4
    else
        throw("Must provide a date object with a valid month (in 1:12)")
    end
end

"""
`subtract_quarters(t1::Date, t0::Date)`

Compute the number of quarters between t1 and t0, including t0 and excluding t1.
"""
function subtract_quarters(t1::Date, t0::Date)
    days = t1 - t0
    quarters = round(days.value / 365.25 * 4.0)
    return convert(Int, quarters)
end


"""
`format_dates!(col, df)`

Change column `col` of dates in `df` from String to Date, and map any dates given in the
interior of a quarter to the last day of the quarter.
"""
function format_dates!(col::Symbol, df::DataFrame)
    df[col] = Date.(df[col])
    map!(lastdayofquarter, df[col], df[col])
end

"""
```
missing2nan!(df::DataArray)
```

Convert all elements of Union{X, Missing.Missing} and the like to type X.
"""
function missing2nan!(v::Array{Union{T, Missing}}) where {T}
    valid_types = [Date, Float64]
    new_v = tryparse.(new_type, v)
    if all(isnull.(new_v))
        new_v = tryparse.(Date, new_v)
    end
end

"""
```
na2nan!(df::DataFrame)
```

Convert all NAs in a DataFrame to NaNs.
"""
function na2nan!(df::DataFrame)
    for col in names(df)
        df[ismissing.(df[col]), col] = NaN
    end
end

"""
```
na2nan!(df::DataArray)
```

Convert all NAs in a DataArray to NaNs.
"""
function na2nan!(v::Array{Union{T, Missing}}) where {T}
    for i = 1:length(v)
        v[i] = ismissing(v[i]) ?  NaN : v[i]
    end
end

"""
```
nan_cond_vars!(m, df; cond_type = :none)
```

NaN out conditional period variables not in `cond_semi_names(m)` or
`cond_full_names(m)` if necessary.
"""
function nan_cond_vars!(m::AbstractModel, df::DataFrame; cond_type::Symbol = :none)
    if cond_type in [:semi, :full]
        # Get appropriate
        cond_names = if cond_type == :semi
            cond_semi_names(m)
        elseif cond_type == :full
            cond_full_names(m)
        end

        # NaN out non-conditional variables
        cond_names_nan = setdiff(names(df), [cond_names; :date])
        T = eltype(df[:, cond_names_nan])
        df[df[:, :date] .>= date_forecast_start(m), cond_names_nan] = convert(T, NaN)

        # Warn if any conditional variables are missing
        for var in cond_names
            if any(isnan.(df[df[:, :date] .>= date_forecast_start(m), var]))
                warn("Missing some conditional observations for " * string(var))
            end
        end
    end
end

"""
```
get_data_filename(m, cond_type)
```

Returns the data file for `m`, which depends on `data_vintage(m)`, and if
`cond_type in [:semi, :full]`, also on `cond_vintage(m)` and `cond_id(m)`.
"""
function get_data_filename(m::AbstractModel, cond_type::Symbol)
    filestrings = ["data"]

    # If writing conditional data, append conditional vintage and ID to filename
    if cond_type in [:semi, :full]
        push!(filestrings, "cdid=" * lpad(cond_id(m), 2, '0'))
        push!(filestrings, "cdvt=" * cond_vintage(m))
    end

    push!(filestrings, "dsid=" * lpad(data_id(m), 2, '0'))
    push!(filestrings, "vint=" * data_vintage(m))
    filename = join(filestrings, "_")

    return inpath(m, "data", filename * ".csv")
end

"""
```
iterate_quarters(start::Date, quarters::Int)
```

Returns the date corresponding to `start` + `quarters` quarters.

### Inputs
- `start`: starting date
- `quarters`: number of quarters to iterate forward or backward
"""
function iterate_quarters(start::Date, quarters::Int)

    next = start
    if quarters < 0
        for n = 1:-quarters
            next = Dates.toprev(next) do x
                Dates.lastdayofquarter(x) == x
            end
        end
    elseif quarters > 0
        for n = 1:quarters
            next = Dates.tonext(next) do x
                Dates.lastdayofquarter(x) == x
            end
        end
    end

    next
end

"""
```
reconcile_column_names(a::DataFrame, b::DataFrame)
```

adds columns of NaNs to a and b so that both have
the same set of column names.
"""
function reconcile_column_names(a::DataFrame, b::DataFrame)
    new_a_cols = setdiff(names(b), names(a))
    new_b_cols = setdiff(names(a), names(b))
    for col in new_a_cols
        a[col] = fill(NaN, size(a, 1))
    end
    for col in new_b_cols
        b[col] = fill(NaN, size(b, 1))
    end
    return a, b
end
