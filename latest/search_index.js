var documenterSearchIndex = {"docs": [

{
    "location": "index.html#",
    "page": "Home",
    "title": "Home",
    "category": "page",
    "text": ""
},

{
    "location": "index.html#DSGE.jl-1",
    "page": "Home",
    "title": "DSGE.jl",
    "category": "section",
    "text": "CurrentModule = DSGEThe DSGE.jl package implements the FRBNY DSGE model and provides general code to estimate many user-specified DSGE models. The package is introduced in the Liberty Street Economics blog post The FRBNY DSGE Model Meets Julia.This Julia-language implementation mirrors the MATLAB code included in the Liberty Street Economics blog post The FRBNY DSGE Model Forecast.FRBNY is currently working on extending the code to include forecasts and other features. Extensions of the DSGE model code may be released in the future at the discretion of FRBNY."
},

{
    "location": "index.html#Table-of-Contents-1",
    "page": "Home",
    "title": "Table of Contents",
    "category": "section",
    "text": "Pages = [\n  \"model_design.md\",\n  \"running_existing_model.md\",\n  \"advanced_usage.md\",\n  \"input_data.md\",\n  \"frbny_data.md\",\n  \"implementation_details.md\",\n  \"solving.md\",\n  \"estimation.md\",\n  \"contributing.md\",\n  \"license.md\"\n]"
},

{
    "location": "index.html#Acknowledgements-1",
    "page": "Home",
    "title": "Acknowledgements",
    "category": "section",
    "text": "Developers of this package at FRBNY includeAbhi Gupta\nPearl Li\nErica Moszkowski\nMicah SmithContributors to this package at QuantEcon includeZac Cranko\nSpencer Lyon\nPablo WinantThe gensys and csminwel routines DSGE.gensys and DSGE.csminwel are based on routines originally copyright Chris Sims. The files are released here with permission of Chris Sims under the BSD-3 License.The kalman_filter routine is loosely based on a version of the Kalman filter algorithm originally copyright Federal Reserve Bank of Atlanta and written by Iskander Karibzhanov. The files are released here with permission of the Federal Reserve Bank of Atlanta under the BSD-3 License."
},

{
    "location": "model_design.html#",
    "page": "Model Design",
    "title": "Model Design",
    "category": "page",
    "text": ""
},

{
    "location": "model_design.html#Model-Design-1",
    "page": "Model Design",
    "title": "Model Design",
    "category": "section",
    "text": "DSGE.jl is an object-oriented approach to solving the FRBNY DSGE model that takes advantage of Julia's type system, multiple dispatch, package-handling mechanism, and other features. A single model object centralizes all information about the model's parameters, states, equilibrium conditions, and settings in a single data structure. The model object also keeps track of file locations for all I/O operations.The following objects define a model:Parameters\n: Have values, bounds, fixed-or-not status, priors. An   instance of the \nAbstractParameter\n type houses all information about a given   parameter in a single data structure.\nStates\n: Mappings of names to indices (e.g. \nπ_t\n -> 1).\nEquilibrium Conditions\n: A function that takes parameters and model   indices, then returns \nΓ0\n, \nΓ1\n, \nC\n, \nΨ\n, and \nΠ\n (which fully describe the   model in canonical form).\nMeasurement Equation\n: A function mapping states to observables.These are enough to define the model structure. _Everything else_ is essentially a function of these basics, and we can solve the model and forecast observables via the following chain:Parameters + Model Indices + Equilibrium conditions -> Transition matrices   in state-space form\nTransition matrices + Data -> Estimated parameter values\nEstimated parameters + Transition matrices + Data -> Forecast (not yet   implemented)"
},

{
    "location": "running_existing_model.html#",
    "page": "Running An Existing Model",
    "title": "Running An Existing Model",
    "category": "page",
    "text": ""
},

{
    "location": "running_existing_model.html#Running-an-Existing-Model-1",
    "page": "Running An Existing Model",
    "title": "Running an Existing Model",
    "category": "section",
    "text": "The DSGE.jl package provides 2 example models:The well-known \nSmets and Wouters (2007)\n Model\nThe FRBNY DSGE Model (version 990.2), which was introduced in \nthis blog postYou can run these models using the description provided here. If you were to implement another model using DSGE.jl, these procedures can also be used to estimate those models."
},

{
    "location": "running_existing_model.html#Running-with-Default-Settings-1",
    "page": "Running An Existing Model",
    "title": "Running with Default Settings",
    "category": "section",
    "text": "To run the estimation step in Julia, simply create an instance of the model object and pass it to the estimate function – see an example.# construct a model object\nm = Model990()\n\n# estimate as of 2015-Q3 using the default data vintage from 2015 Nov 27\nm <= Setting(:data_vintage, \"151127\")\nm <= Setting(:date_mainsample_end, quartertodate(\"2015-Q3\"))\n\n# reoptimize parameter vector, compute Hessian at mode, and full posterior\n# parameter sampling\nestimate(m)\n\n# produce LaTeX tables of parameter moments\ncompute_moments(m)By default, the estimate routine loads the dataset, reoptimizes the initial parameter vector, computes the Hessian at the mode, and conducts full posterior parameter sampling. (The initial parameter vector used is specified in the model's constructor.)To use updated data or alternative user-specified datasets, see Input Data.The user may want to avoid reoptimizing the parameter vector and calculating the Hessian matrix at this new vector. Please see Reoptimizing.For more details on changing the model's default settings, parameters, equilibrium conditions, etc., see Advanced Usage."
},

{
    "location": "running_existing_model.html#Input/Output-Directory-Structure-1",
    "page": "Running An Existing Model",
    "title": "Input/Output Directory Structure",
    "category": "section",
    "text": "The DSGE.jl estimation uses data files as input and produces large data files as outputs. One estimation saves several GB of parameter draws and related outputs. It is useful to understand how these files are loaded/saved and how to control this behavior."
},

{
    "location": "running_existing_model.html#Directory-Tree-1",
    "page": "Running An Existing Model",
    "title": "Directory Tree",
    "category": "section",
    "text": "The following subdirectory tree indicates the default locations of these input and outputs. Square brackets indicate directories in the tree that will become relevant as future features are implemented.Note that this directory tree is not linked, although it appears to be.Pages = [\"io_dirtree.md\"]\nDepth = 5"
},

{
    "location": "running_existing_model.html#DSGE.inpath",
    "page": "Running An Existing Model",
    "title": "DSGE.inpath",
    "category": "Function",
    "text": "inpath{T<:AbstractString}(m::AbstractModel, in_type::T, file_name::T=\"\")\n\nReturns path to specific input data file, creating containing directory as needed. If file_name not specified, creates and returns path to containing directory only. Valid in_type includes:\n\n\"data\"\n: recorded data\n\"cond\"\n: conditional data - nowcasts for the current forecast quarter, or related\n\"user\"\n: user-supplied data for starting parameter vector, hessian, or related\n\nPath built as\n\n<data root>/<in_type>/<file_name>\n\n\n\n"
},

{
    "location": "running_existing_model.html#DSGE.rawpath",
    "page": "Running An Existing Model",
    "title": "DSGE.rawpath",
    "category": "Function",
    "text": "rawpath{T<:AbstractString}(m::AbstractModel, out_type::T, file_name::T=\"\")\n\nReturns path to specific raw output file, creating containing directory as needed. If file_name not specified, creates and returns path to containing directory only. Path built as\n\n<output root>/output_data/<spec>/<subspec>/<out_type>/raw/<file_name>_<filestring>.<ext>\n\n\n\n"
},

{
    "location": "running_existing_model.html#DSGE.logpath",
    "page": "Running An Existing Model",
    "title": "DSGE.logpath",
    "category": "Function",
    "text": "logpath(model)\n\nReturns path to log file. Path built as\n\n<output root>/output_data/<spec>/<subspec>/log/log_<filestring>.log\n\n\n\n"
},

{
    "location": "running_existing_model.html#DSGE.workpath",
    "page": "Running An Existing Model",
    "title": "DSGE.workpath",
    "category": "Function",
    "text": "workpath{T<:AbstractString}(m::AbstractModel, out_type::T, file_name::T=\"\")\n\nReturns path to specific work output file, creating containing directory as needed. If file_name not specified, creates and returns path to containing directory only. Path built as\n\n<output root>/output_data/<spec>/<subspec>/<out_type>/work/<file_name>_<filestring>.<ext>\n\n\n\n"
},

{
    "location": "running_existing_model.html#DSGE.tablespath",
    "page": "Running An Existing Model",
    "title": "DSGE.tablespath",
    "category": "Function",
    "text": "tablespath{T<:AbstractString}(m::AbstractModel, out_type::T, file_name::T=\"\")\n\nReturns path to specific tables output file, creating containing directory as needed. If file_name not specified, creates and returns path to containing directory only. Path built as\n\n<output root>/output_data/<spec>/<subspec>/<out_type>/tables/<file_name>_<filestring>.<ext>\n\n\n\n"
},

{
    "location": "running_existing_model.html#DSGE.figurespath",
    "page": "Running An Existing Model",
    "title": "DSGE.figurespath",
    "category": "Function",
    "text": "figurespath{T<:AbstractString}(m::AbstractModel, out_type::T, file_name::T=\"\")\n\nReturns path to specific figures output file, creating containing directory as needed. If file_name not specified, creates and returns path to containing directory only. Path built as\n\n<output root>/output_data/<spec>/<subspec>/<out_type>/figures/<file_name>_<filestring>.<ext>\n\n\n\n"
},

{
    "location": "running_existing_model.html#Directory-Paths-1",
    "page": "Running An Existing Model",
    "title": "Directory Paths",
    "category": "section",
    "text": "By default, input/output directories are located in the DSGE.jl package, along with the source code. Default values of the input/output directory roots:saveroot(m)\n: \n\"$(Pkg.dir())/DSGE/save\"\ndataroot(m)\n: \n\"$(Pkg.dir())/DSGE/save/input_data\"Note these locations can be overridden as desired. See Model Settings for more details.m <= Setting(:saveroot, \"path/to/my/save/root\")\nm <= Setting(:dataroot, \"path/to/my/data/root\")Utility functions are provided to create paths to input/output files. These should be used for best results.DSGE.inpath\nDSGE.rawpath\nDSGE.logpath\nDSGE.workpath\nDSGE.tablespath\nDSGE.figurespath"
},

{
    "location": "advanced_usage.html#",
    "page": "Advanced Usage",
    "title": "Advanced Usage",
    "category": "page",
    "text": ""
},

{
    "location": "advanced_usage.html#Advanced-Usage-1",
    "page": "Advanced Usage",
    "title": "Advanced Usage",
    "category": "section",
    "text": "CurrentModule = DSGE"
},

{
    "location": "advanced_usage.html#Package-Directory-Structure-1",
    "page": "Advanced Usage",
    "title": "Package Directory Structure",
    "category": "section",
    "text": "The package directory structure follows Julia module conventions. Directories in square brackets indicate future additions. Note that this directory tree is not linked, although it appears to be.Pages = [\"pkg_structure.md\"]\nDepth = 5"
},

{
    "location": "advanced_usage.html#Working-with-Settings-1",
    "page": "Advanced Usage",
    "title": "Working with Settings",
    "category": "section",
    "text": "There are many computational settings that affect how the code runs without affecting the mathematical definition of the model. Below, we describe several important settings for package usage.For more details on implementation and usage of settings, see Model Settings.See defaults.jl for the complete description of default settings."
},

{
    "location": "advanced_usage.html#General-1",
    "page": "Advanced Usage",
    "title": "General",
    "category": "section",
    "text": "dataroot\n: The root directory for   model input data.\nsaveroot\n: The root directory for model output.\nuse_parallel_workers\n: Use available parallel workers in computaitons.\ndata_vintage\n: Data vintage identifier, formatted   \nyymmdd\n. By default, \ndata_vintage\n is set to today's date. It is (currently) the only   setting printed to output filenames by default."
},

{
    "location": "advanced_usage.html#Dates-1",
    "page": "Advanced Usage",
    "title": "Dates",
    "category": "section",
    "text": "date_presample_start\n: Start date of pre-sample.\ndate_mainsample_start\n: Start date of main sample.\ndate_zlbregime_start\n: Start date of zero lower bound regime.\ndate_mainsample_end\n: End date of main sample.\ndate_forecast_start\n: Start date of forecast period.\ndate_forecast_end\n: End date of forecast period."
},

{
    "location": "advanced_usage.html#Anticipated-Shocks-1",
    "page": "Advanced Usage",
    "title": "Anticipated Shocks",
    "category": "section",
    "text": "n_anticipated_shocks\n: Number of anticipated policy shocks.\nn_anticipated_shocks_padding\n: Padding for anticipated shocks."
},

{
    "location": "advanced_usage.html#Estimation-1",
    "page": "Advanced Usage",
    "title": "Estimation",
    "category": "section",
    "text": "reoptimize\n: Whether to reoptimize the posterior mode. If \ntrue\n     (the default), \nestimate()\n begins reoptimizing from the model     object's parameter vector. See \nOptimizing or Reoptimizing\n for more details.\ncalculate_hessian\n: Whether to compute the Hessian. If \ntrue\n (the     default), \nestimate()\n calculates the Hessian at the posterior mode."
},

{
    "location": "advanced_usage.html#Metropolis-Hastings-1",
    "page": "Advanced Usage",
    "title": "Metropolis-Hastings",
    "category": "section",
    "text": "n_mh_simulations\n: Number of draws from the posterior distribution per block.\nn_mh_blocks\n: Number of blocks to run Metropolis-Hastings.\nn_mh_burn\n: Number of blocks to discard as burn-in for Metropolis-Hastings.\nmh_thin\n: Metropolis-Hastings thinning step."
},

{
    "location": "advanced_usage.html#Accessing-Settings-1",
    "page": "Advanced Usage",
    "title": "Accessing Settings",
    "category": "section",
    "text": "The function get_setting(m::AbstractModel, s::Symbol) returns the value of the setting s in m.settings. Some settings also have explicit getter methods that take only the model object m as an argument. Note that not all are exported.I/O:saveroot(m)\n,\ndataroot(m)\n,\ndata_vintage(m)\n,Parallelization:use_parallel_workers(m)Estimation:reoptimize(m)\n,\ncalculate_hessian(m)\n,Metropolis-Hastings:n_mh_blocks(m)\n,\nn_mh_simulations(m)\n,\nn_mh_burn(m)\n,\nmh_thin(m)"
},

{
    "location": "advanced_usage.html#Overwriting-Default-Settings-1",
    "page": "Advanced Usage",
    "title": "Overwriting Default Settings",
    "category": "section",
    "text": "To overwrite default settings added during model construction, a user must define a new Setting object and update the corresponding entry in the model's settings dictionary using the <= syntax. If the print, code, and description fields of the new Setting object are not provided, the fields of the existing setting will be maintained. If new values for print, code, and description are specified, and if these new values are distinct from the defaults for those fields, the fields of the existing setting will be updated.For example, overwriting use_parallel_workers should look like this:m = Model990()\nm <= Setting(:use_parallel_workers, true)"
},

{
    "location": "advanced_usage.html#editing-extending-model-1",
    "page": "Advanced Usage",
    "title": "Editing or Extending a Model",
    "category": "section",
    "text": "Users may want to extend or edit Model990 in a number of different ways.  The most common changes are listed below, in decreasing order of complexity:Add new parameters\nModify equilibrium conditions or measurement equations\nChange the values of various parameter fields (i.e. initial \nvalue\n, \nprior\n,    \ntransform\n, etc.)\nChange the values of various computational settings (i.e. \nreoptimize\n,    \nn_mh_blocks\n)Points 1 and 2 often go together (adding a new parameter guarantees a change in equilibrium conditions), and are such fundamental changes that they increment the model specification number and require the definition of a new subtype of AbstractModel (for instance, Model991).  See Model specification for more details.Any changes to the initialization of preexisting parameters are defined as a new model sub-specification, or subspec. While less significant than a change to the model's equilibrium conditions, changing the values of some parameter fields (especially priors) can have economic significance over and above settings we use for computational purposes. Parameter definitions should not be modified in the model object's constructor. First, incrementing the model's sub-specification number when parameters are changed improves model-level (as opposed to code-level) version control. Second, it avoids potential output filename collisions, preventing the user from overwriting output from previous estimations with the original parameters. The protocol for defining new sub-specifications is described in Model sub-specifications.Overriding default settings is described in the Model Settings section."
},

{
    "location": "advanced_usage.html#model-specification-mspec-1",
    "page": "Advanced Usage",
    "title": "Model specification (m.spec)",
    "category": "section",
    "text": "A particular model, which corresponds to a subtype of AbstractModel, is defined as a set of parameters, equilibrium conditions (defined by the eqcond function) and measurement equations (defined by the measurement function).  Therefore, the addition of new parameters, states, or observables, or any changes to the equilibrium conditions or measurement equations necessitate the creation of a new subtype of AbstractModel.To create a new model object, we recommend doing the following:Duplicate the \nm990\n directory within the \nmodels\n directory. Name the new    directory \nmXXX.jl\n, where \nXXX\n is your chosen model specification number or string.    Rename \nm990.jl\n in this directory to \nmXXX.jl\n.\nIn the \nmXXX/\n directory, change all references to \nModel990\n to \nModelXXX\n.\nEdit the \nm990.jl\n, \neqcond.jl\n, and \nmeasurement.jl\n files as you see fit.  If adding    new states, equilibrium conditions, shocks, or observables, be sure to add them to the    appropriate list in \ninit_model_indices\n.\nOpen the module file, \nsrc/DSGE.jl\n. Add \nModelXXX\n to the list of functions to export,    and include each of the files in \nsrc/model/mXXX\n."
},

{
    "location": "advanced_usage.html#model-sub-specifications-msubspec-1",
    "page": "Advanced Usage",
    "title": "Model sub-specifications (m.subspec)",
    "category": "section",
    "text": "Model990 sub-specifications are initialized by overwriting initial parameter definitions before the model object is fully constructed. This happens via a call to init_subspec in the Model990 constructor. (Clearly, an identical protocol should be followed for new model types as well.)To create a new sub-specification (e.g., subspec 1) of Model990, edit the file src/models/subspecs.jl as follows (note that this example is not actually sub-specification 1 of Model990. In the source code, our sub-specification 5 is provided as additional example.):Step 1. Define a new function, ss1, that takes an object of type Model990 (not    AbstractModel!) as an argument. In this function, construct new parameter objects and    overwrite existing model parameters using the <= syntax. For example,function ss1(m::Model990)\n    m <= parameter(:ι_w, 0.000, (0.0, .9999), (0.0,0.9999), DSGE.Untransformed(), Normal(0.0,1.0), fixed=false,\n                   description=\"ι_w: Some description.\",\n                   tex_label=\"\\\\iota_w\")\n    m <= parameter(:ι_p, 0.0, fixed=true,\n                   description= \"ι_p: Some description\"\n                   tex_label=\"\\\\iota_p\")\nendStep 2. Add an elseif condition to init_subspec:    ...\n    elseif subspec(m) == \"ss1\"\n        return ss1(m)\n    ...To construct an instance of Model990, ss1, call the constructor for Model990 with ss1 as an argument. For example,m = Model990(\"ss1\")"
},

{
    "location": "input_data.html#",
    "page": "Input Data",
    "title": "Input Data",
    "category": "page",
    "text": ""
},

{
    "location": "input_data.html#Input-Data-1",
    "page": "Input Data",
    "title": "Input Data",
    "category": "section",
    "text": "CurrentModule = DSGEGiven all of the hard work put into specifying the model, one should be able to maintain the input data painlessly. To that extent, DSGE.jl provides facilities to download appropriate vintages of data series from FRED (Federal Reserve Economic Data).Note that a sample input dataset for use with model m990 is provided; see FRBNY Model 990 Data for more details. To update this sample dataset for use with model m990, see Update sample input data."
},

{
    "location": "input_data.html#Setup-1",
    "page": "Input Data",
    "title": "Setup",
    "category": "section",
    "text": "To take advantage of the ability to automatically download data series from FRED via the FredData.jl package, set up your FRED API access by following the directions here."
},

{
    "location": "input_data.html#Loading-data-1",
    "page": "Input Data",
    "title": "Loading data",
    "category": "section",
    "text": "At the most basic, loading data looks like this:m = Model990()\ndf = load_data(m)By default, load_data will look on the disk first to see if an appropriate vintage of data is already present. If data on disk are not present, or if the data are invalid for any reason, a fresh vintage will be downloaded from FRED and merged with the other data sources specified. See load_data for more details.The resulting DataFrame df contains all the required data series for this model, fully transformed. The first row is given by the Setting date_presample_start and the last row is given by date_mainsample_end. The first n_presample_periods rows of df are the presample.Driver functions including estimate accept this df as an argument and convert it into a Matrix suitable for computations using df_to_matrix, which sorts the data, ensures the full sample is present, discards the date column, and sorts the observable columns according to the observables field of the model object."
},

{
    "location": "input_data.html#Non-FRED-data-sources-1",
    "page": "Input Data",
    "title": "Non-FRED data sources",
    "category": "section",
    "text": "Some data series may not be available from FRED or one may simply wish to use a different data source, for whatever reason. The data sources and series are specified in the data_series field of the model object. For each data source that is not :fred, a well-formed CSV of the form <source>_<yymmdd>.csv is expected in the directory indicated by inpath(m, \"data\").  For example, the following might be the contents of a data source for two series :series1 and :series2:date,series1,series2\n1959-06-30,1.0,NaN\n1959-09-30,1.1,0.5\netc.Note that quarters are represented by the date of the last day of the quarter and missing values are specified by NaN."
},

{
    "location": "input_data.html#Example-1",
    "page": "Input Data",
    "title": "Example",
    "category": "section",
    "text": "Let's consider an example dataset comprised of 10 macro series sourced from FRED and one survey-based series sourced from, say, the Philadelphia Fed's Survey of Professional Forecasters via Haver Analytics:julia> m.data_series\nDict{Symbol,Array{Symbol,1}} with 2 entries:\n :spf   => [:ASACX10]\n :fred  => [:GDP, :PCE, ...] #etcIf the data vintage specified for the model is 151127 (Nov. 27, 2015), then the following files are expected in inpath(m, \"data\"):spf_151127.csv\nfred_151127.csvThe FRED series will be downloaded and the fred_151127.csv file will be automatically generated, but the spf_151127.csv file must be manually compiled as shown above:date,ASACX10\n1991-12-31,4.0\netc.Now, suppose that we set the data vintage to 151222, to incorporate the BEA's third estimate of GDP. The fred_151222.csv file will be downloaded, but there are no updates to the SPF dataset during this period. Regardless, the file spf_151222.csv must be present to match the data vintage. The solution in this case is to manually copy and rename the older SPF dataset. Although this is not an elegant approach, it is consistent with the concept of a vintage as the data available at a certain point in time –- in this example, it just so happens that the SPF data available on Nov. 27 and Dec. 22 are the same."
},

{
    "location": "input_data.html#Incorporate-population-forecasts-1",
    "page": "Input Data",
    "title": "Incorporate population forecasts",
    "category": "section",
    "text": "Many variables enter the model in per-capita terms. To that extent, we use data on population levels to adjust aggregate variables into per-capita variables. Furthermore, we apply the Hodrick-Prescott filter (\"H-P filter\") to the population levels to smooth cyclical components.The user will ultimately want to produce forecasts of key variables such as GDP and then represent these forecasts in standard terms. That is, one wants to report GDP forecasts in aggregate terms, which is standard, rather than per-capita terms. To do this, we either extrapolate from the last periods of population growth in the data, or use external population forecasts.Note that if external population forecasts are provided, non-forecast procedures, such as model estimation, are also affected because the H-P filter smoothes back from the latest observation.To incorporate population forecasts,Set the model setting \nuse_population_forecast\n to \ntrue\n.\nProvide a file \npopulation_forecast_<yymmdd>.csv\n to \ninpath(m, \"data\")\n. Population    forecasts should be in levels, and represent the same series as given by the    \npopulation_mnemonic\n setting (defaults to \n:CNP16OV\n, or \"Civilian Noninstitutional    Population, Thousands\"). If your population forecast is in growth rates, convert it to    levels yourself. The first row of data should correspond to the last period of    the main sample, such that growth rates can be computed. As many additional rows of    forecasts as desired can be provided.The file should look like this:date,POPULATION\n2015-12-31,250000\n2016-03-31,251000\netc."
},

{
    "location": "input_data.html#Dataset-creation-implementation-details-1",
    "page": "Input Data",
    "title": "Dataset creation implementation details",
    "category": "section",
    "text": "Let's quickly walk through the steps DSGE.jl takes to create a suitable dataset.First, a user provides a detailed specification of the data series and transformations used for their model.the user specifies \nm.observables\n; the keys of this dictionary name     the series to be used in estimating the model.     \nthe user specifies \nm.data_series\n; the keys of this dictionary name data sources, and the     values of this dictionary are lists of mnemonics to be accessed from that data source.     Note that these mnemonics do not correspond to observables one-to-one, but rather are     usually series in \nlevels\n that will be further transformed.the user specifies \nm.data_transforms\n; the keys of this dictionary     name the series to be constructed and match the keys of     \nm.observables\n exactly; the values of this dictionary are     functions that operate on a single argument (\nlevels\n) which is a     DataFrame of the series specified in \nm.data_series\n. These     functions return a DataArray for a single series. These functions     could do nothing (e.g. return \nlevels[:, :SERIES1]\n) or perform a     more complex transformation, such as converting to one quarter     percent changes or adjusting into per-capita terms. See \nData Transforms and Utilities\n for functions that may be     of use when defining series-specific transformations.the user adjusts data-related settings, such as \ndata_vintage\n, \ndataroot\n,     \ndate_presample_start\n, \ndate_mainsample_end\n, and \ndate_zlbregime_start\n, and     \nuse_population_forecast\n.Second, DSGE.jl attempts to construct the dataset given this setup through a call to load_data. See load_data for more details.Intermediate data in levels are loaded. See \nload_data_levels\n for more details.\nTransformations are applied to the data in levels. See \ntransform_data\n for more details.\nThe data are saved to disk. See \nsave_data\n for more details."
},

{
    "location": "input_data.html#Common-pitfalls-1",
    "page": "Input Data",
    "title": "Common pitfalls",
    "category": "section",
    "text": "Given the complexity of the data download, you may find that the dataset generated by load_data is not exactly as you expect. Here are some common pitfalls to look out for:Ensure that the \ndata_vintage\n model setting is as you expect. (Try checking     \ndata_vintage(m)\n.)\nEnsure that the \ndate_mainsample_end\n model setting is as you expect, and that is not     logically incompatible with \ndata_vintage\n.\nEnsure that the \ndata_series\n field of the model object is set as expected.\nDouble check the transformations specified in the \ndata_transforms\n field of the model     object.\nEnsure that the keys of the \nobservables\n and \ndata_transforms\n fields of the model object     match.\nCheck the input files for \nNon-FRED data sources\n. They should be     in the directory indicated by \ninpath(m, \"data\")\n, be named appropriately given the     vintage of data expected, and be formatted appropriately. One may have to copy and     rename files of non-FRED data sources to match the specified vintage, even if the     contents of the files would be identical.\nLook for any immediate issues in the final dataset saved (\ndata_<yymmdd>.csv\n). If a data     series in this file is all \nNaN\n values, then likely a non-FRED data source was not     provided correctly.\nEnsure that the column names of the data CSV match the keys of the \nobservables\n field of     the model object.\nYou may receive a warning that an input data file \"does not contain the entire date range     specified\". This means that observations are not provided for some periods in which the     model requires data. This is perfectly okay if your data series starts after     \ndate_presample_start\n.If you experience any problems using FredData.jl, ensure your API key is provided correctly and that there are no issues with your firewall, etc. Any issues with FredData.jl proper should be reported on that project's page."
},

{
    "location": "input_data.html#Update-sample-input-data-1",
    "page": "Input Data",
    "title": "Update sample input data",
    "category": "section",
    "text": "A sample dataset is provided for the 2015 Nov 27 vintage. To update this dataset:Step 1. See Setup to setup automatic data pulls using FredData.jl.Step 2. Specify the exact data vintage desired:julia>  m <= Setting(:data_vintage, \"yymmdd\")Step 3. Create data files for the non-FRED data sources (specified in    m.data_series). For model m990, the required data files include    spf_<yymmdd>.csv (with column ASACX10), longrate_<yymmdd>.csv    (with column FYCCZA), and fernald_<yymmdd>.csv (with columns    TFPJQ and TFPKQ). To include data on expected interest rates,    the file ois_<yymmdd>.csv is also required. To include data on    population forecasts, the file population_forecst_<yymmdd>.csv is    also required (see Incorporate population forecasts. See    FRBNY Model Input Data for details on the series    used and links to data sources.Step 4. Run load_data(m); series from FRED will be downloaded and merged with the series from    non-FRED data sources that you have already created. See Common pitfalls for some potential issues."
},

{
    "location": "input_data.html#DSGE.df_to_matrix-Tuple{DSGE.AbstractModel{T},DataFrames.DataFrame}",
    "page": "Input Data",
    "title": "DSGE.df_to_matrix",
    "category": "Method",
    "text": "df_to_matrix(m::AbstractModel, df::DataFrame)\n\nReturn df, converted to matrix of floats, and discard date column. Also ensure data are sorted by date and that rows outside of sample are discarded. The output of this function is suitable for direct use in estimate, posterior, etc.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.load_data-Tuple{DSGE.AbstractModel{T}}",
    "page": "Input Data",
    "title": "DSGE.load_data",
    "category": "Method",
    "text": "load_data(m::AbstractModel; try_disk::Bool = true, verbose::Symbol = :low)\n\nCreate a DataFrame with all data series for this model, fully transformed.  \n\nFirst, check the disk to see if a valid dataset is already stored in inpath(m, \"data\"). A dataset is valid if every series in m.data_transforms is present and the entire sample is contained (from date_presample_start to date_mainsample_end. If no valid dataset is already stored, the dataset will be recreated. This check can be eliminated by passing try_disk=false.\n\nIf the dataset is to be recreated, in a preliminary stage, intermediate data series, as specified in m.data_series, are loaded in levels using load_data_levels. See ?load_data_levels for more details.\n\nThen, the series in levels are transformed as specified in m.data_transforms. See ?transform_data for more details.\n\nThe resulting DataFrame is saved to disk as data_<yymmdd>.csv and returned to the caller.  \n\n\n\n"
},

{
    "location": "input_data.html#DSGE.load_data_levels-Tuple{DSGE.AbstractModel{T}}",
    "page": "Input Data",
    "title": "DSGE.load_data_levels",
    "category": "Method",
    "text": "load_data_levels(m::AbstractModel; verbose::Symbol=:low)\n\nLoad data in levels by appealing to the data sources specified for the model. Data from FRED is loaded first, by default; then, merge other custom data sources.\n\nCheck on disk in inpath(m, \"data\") datasets, of the correct vintage, corresponding to the ones in keys(m.data_series). Load the appropriate data series (specified in m.data_series[source]) for each data source. \n\nTo accomodate growth rates and other similar transformations, more rows of data may be downloaded than otherwise specified by the date model settings. (By the end of the process, these rows will have been dropped.)\n\nData from FRED (i.e. the :fred data source) are treated separately. These are downloaded using load_fred_data. See ?load_fred_data for more details.\n\nData from non-FRED data sources are read from disk, verified, and merged.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.save_data-Tuple{DSGE.AbstractModel{T},DataFrames.DataFrame}",
    "page": "Input Data",
    "title": "DSGE.save_data",
    "category": "Method",
    "text": "save_data(m::AbstractModel, df::DataFrame)\n\nSave df to disk as CSV. File is located in inpath(m, \"data\").\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.load_fred_data-Tuple{DSGE.AbstractModel{T}}",
    "page": "Input Data",
    "title": "DSGE.load_fred_data",
    "category": "Method",
    "text": "load_fred_data(m::AbstractModel; start_date=\"1959-03-31\", end_date=prev_quarter())\n\nChecks in inpath(m) for a FRED dataset corresponding to data_vintage(m). If a FRED vintage exists on disk, any required FRED series that is contained therein will be imported. All missing series will be downloaded directly from FRED using the FredData package. The full dataset is written to the appropriate data vintage file and returned.\n\nArguments\n\nm::AbstractModel\n: the model object\nstart_date\n: starting date.\nend_date\n: ending date.\n\nNotes\n\nThe FRED API reports observations according to the quarter-start date. load_fred_data returns data indexed by quarter-end date for compatibility with other datasets.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.transform_data-Tuple{DSGE.AbstractModel{T},DataFrames.DataFrame}",
    "page": "Input Data",
    "title": "DSGE.transform_data",
    "category": "Method",
    "text": "transform_data(m::AbstractModel, levels::DataFrame; verbose::Symbol = :low)\n\nTransform data loaded in levels and order columns appropriately for the DSGE model. Returns DataFrame of transformed data.\n\nThe DataFrame levels is output from load_data_levels. The series in levels are transformed as specified in m.data_transforms. - To prepare for per-capita transformations, population data are filtered using     hpfilter. The series in levels to use as the population series is given by the     population_mnemonic setting. If use_population_forecast is true, a population     forecast is appended to the recorded population levels before the filtering. Both     filtered and unfiltered population levels and growth rates are added to the levels     data frame. - The transformations are applied for each series using the levels DataFrame as input.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.annualtoquarter-Tuple{Any}",
    "page": "Input Data",
    "title": "DSGE.annualtoquarter",
    "category": "Method",
    "text": "annualtoquarter(v)\n\nConvert from annual to quarter frequency... by dividing by 4.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.difflog-Tuple{Array{T<:AbstractFloat,1}}",
    "page": "Input Data",
    "title": "DSGE.difflog",
    "category": "Method",
    "text": "difflog(x::Vector{AbstractFloat})\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.difflog-Tuple{DataArrays.DataArray{T,N}}",
    "page": "Input Data",
    "title": "DSGE.difflog",
    "category": "Method",
    "text": "difflog(x::DataArray{AbstractFloat})\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.hpadjust-Tuple{Any,Any}",
    "page": "Input Data",
    "title": "DSGE.hpadjust",
    "category": "Method",
    "text": "hpadjust(y, df)\n\nAdjust series to compensate for differences between filtered and unfiltered population.\n\nArguments\n\ny\n: A vector of data\ndf\n: DataFrame containing both a filtered and unfiltered population growth series\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.hpfilter-Tuple{Any,Real}",
    "page": "Input Data",
    "title": "DSGE.hpfilter",
    "category": "Method",
    "text": "yt, yf = hpfilter(y, λ::Real)\n\nApplies the Hodrick-Prescott filter (\"H-P filter\"). The smoothing parameter λ is applied to the columns of y, returning the trend component yt and the cyclical component yf.   For quarterly data, one can use λ=1600.\n\nConsecutive missing values at the beginning or end of the time series are excluded from the filtering. If there are missing values within the series, the filtered values are all NaN.\n\nSee also:\n\nHodrick, Robert; Prescott, Edward C. (1997). \"Postwar U.S. Business Cycles: An Empirical\nInvestigation\". Journal of Money, Credit, and Banking 29 (1): 1–16.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.nominal_to_real-Tuple{Any,Any}",
    "page": "Input Data",
    "title": "DSGE.nominal_to_real",
    "category": "Method",
    "text": "nominal_to_real(col, df; deflator_mnemonic=:GDPCTPI)\n\nConverts nominal to real values using the specified deflator.\n\nArguments\n\ncol\n: symbol indicating which column of \ndf\n to transform\ndf\n: DataFrame containining series for proper population measure and \ncol\n\nKeyword arguments\n\ndeflator_mnemonic\n: indicates which deflator to use to calculate real values. Default   value is the FRED GDP Deflator mnemonic.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.oneqtrpctchange-Tuple{Any}",
    "page": "Input Data",
    "title": "DSGE.oneqtrpctchange",
    "category": "Method",
    "text": "oneqtrpctchange(y)\n\nCalculates the quarter-to-quarter percentage change of a series.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.percapita-Tuple{DSGE.AbstractModel{T},Symbol,DataFrames.DataFrame}",
    "page": "Input Data",
    "title": "DSGE.percapita",
    "category": "Method",
    "text": "percapita(m, col, df)\npercapita(col, df, population_mnemonic)\n\nConverts data column col of DataFrame df to a per-capita value.\n\nArguments\n\ncol\n: symbol indicating which column of data to transform\ndf\n: DataFrame containining series for proper population measure and \ncol\npopulation_mnemonic\n: a mnemonic found in df for some population measure.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.quartertodate-Tuple{AbstractString}",
    "page": "Input Data",
    "title": "DSGE.quartertodate",
    "category": "Method",
    "text": "quartertodate(string::AbstractString)\n\nConvert string in the form \"YYqX\", \"YYYYqX\", or \"YYYY-qX\" to a Date of the end of the indicated quarter. \"X\" is in {1,2,3,4} and the case of \"q\" is ignored.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.has_saved_data-Tuple{DSGE.AbstractModel{T}}",
    "page": "Input Data",
    "title": "DSGE.has_saved_data",
    "category": "Method",
    "text": "has_saved_data(m::AbstractModel)\n\nDetermine if there is a saved dataset on disk for the required vintage.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.isvalid_data-Tuple{DSGE.AbstractModel{T},DataFrames.DataFrame}",
    "page": "Input Data",
    "title": "DSGE.isvalid_data",
    "category": "Method",
    "text": "isvalid_data(m::AbstractModel, df::DataFrame)\n\nReturn if dataset is valid for this model, ensuring that all observables are contained and that all quarters between the beginning of the presample and the end of the mainsample are contained.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.read_data-Tuple{DSGE.AbstractModel{T}}",
    "page": "Input Data",
    "title": "DSGE.read_data",
    "category": "Method",
    "text": "read_data(m::AbstractModel)\n\nRead CSV from disk as DataFrame. File is located in inpath(m, \"data\").\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.format_dates!-Tuple{Symbol,DataFrames.DataFrame}",
    "page": "Input Data",
    "title": "DSGE.format_dates!",
    "category": "Method",
    "text": "format_dates!(col, df)\n\nChange column col of dates in df from String to Date, and map any dates given in the interior of a quarter to the last day of the quarter.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.get_quarter_ends-Tuple{Date,Date}",
    "page": "Input Data",
    "title": "DSGE.get_quarter_ends",
    "category": "Method",
    "text": "get_quarter_ends(start_date::Date,end_date::Date)\n\nReturns a DataArray of quarter end dates between start_date and end_date.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.na2nan!-Tuple{DataArrays.DataArray{T,N}}",
    "page": "Input Data",
    "title": "DSGE.na2nan!",
    "category": "Method",
    "text": "na2nan!(df::DataFrame)\n\nConvert all NAs in a DataFrame to NaNs.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.na2nan!-Tuple{DataFrames.DataFrame}",
    "page": "Input Data",
    "title": "DSGE.na2nan!",
    "category": "Method",
    "text": "na2nan!(df::DataFrame)\n\nConvert all NAs in a DataFrame to NaNs.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.next_quarter",
    "page": "Input Data",
    "title": "DSGE.next_quarter",
    "category": "Function",
    "text": "next_quarter(q::TimeType = now())\n\nReturns Date identifying last day of the next quarter\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.prev_quarter",
    "page": "Input Data",
    "title": "DSGE.prev_quarter",
    "category": "Function",
    "text": "prev_quarter(q::TimeType = now())\n\nReturns Date identifying last day of the previous quarter\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.stringstodates-Tuple{Any}",
    "page": "Input Data",
    "title": "DSGE.stringstodates",
    "category": "Method",
    "text": "stringstodates(stringarray)\n\nConverts a collection of strings in \"y-m-d\" format to Dates.\n\n\n\n"
},

{
    "location": "input_data.html#DSGE.subtract_quarters-Tuple{Date,Date}",
    "page": "Input Data",
    "title": "DSGE.subtract_quarters",
    "category": "Method",
    "text": "subtract_quarters(t1::Date, t0::Date)\n\nCompute the number of quarters between t1 and t0, including t0 and excluding t1.\n\n\n\n"
},

{
    "location": "input_data.html#Data-Transforms-and-Utilities-1",
    "page": "Input Data",
    "title": "Data Transforms and Utilities",
    "category": "section",
    "text": "Modules = [DSGE]\nPages   = [\"load_data.jl\", \"fred_data.jl\", \"transform_data.jl\", \"transformations.jl\", \"src/data/util.jl\"]\nOrder   = [:function, :type]"
},

{
    "location": "frbny_data.html#",
    "page": "FRBNY Model Input Data",
    "title": "FRBNY Model Input Data",
    "category": "page",
    "text": ""
},

{
    "location": "frbny_data.html#frbny-data-1",
    "page": "FRBNY Model Input Data",
    "title": "FRBNY Model 990 Data",
    "category": "section",
    "text": "CurrentModule = DSGE"
},

{
    "location": "frbny_data.html#Data-Series-1",
    "page": "FRBNY Model Input Data",
    "title": "Data Series",
    "category": "section",
    "text": "The FRBNY DSGE Model takes an CSV file containing a matrix of data as input. The columns of this file contain transformations of the following series (the number corresponds to the column of data matrix): Output Growth (Bureau of Economic Analysis)\n Hours Worked (Bureau of Labor Statistics)\n Real Wage Growth (Bureau of Labor Statistics)\n Inflation (GDP Deflator) (Bureau of Economic Analysis)\n Inflation (Core PCE) (Bureau of Economic Analysis)\n Federal Funds Rate (Board of Governors of the Federal Reserve System)\n Consumption Growth (Bureau of Economic Analysis)\n Investment Growth (Bureau of Economic Analysis)\n Spread (Baa) (Board of Governors of the Federal Reserve System)\n10-year Inflation Expectations (Federal Reserve Bank of Philadelphia)\n10-year Interest Rate (Board of Governors of the Federal Reserve System)\nTotal Factor Productivity (Federal Reserve Bank of San Francisco)The following series are used to transform some series into per capita terms:Civilian Noninstitutional Population 16 Years and Over (Bureau of Labor Statistics)Most data series used to construct the above are retrieved from FRED (Federal Reserve Bank of St. Louis). Other data sources include:The \nTotal Factor Productivity\n series components are made available by the Federal Reserve     Bank of San Francisco, and can be found     \nhere\n (series     \nalpha\n and \ndtfp\n from the linked spreadsheet). Alternatively, they can be     found as series \nTFPJQ@USECON\n (\nalpha\n) and \nTFPKQ@USECON\n (\ndtfp\n) via Haver Analytics. For more details on the series, seeFernald, John. \"A Quarterly, Utilization-Adjusted Series on Total Factor Productivity.\"\nFederal Reserve Bank of San Francisco Working Paper 19 (2012): 20912.The \n10-year Inflation Expectations\n series from the \nSurvey of Professional     Forecasters\n is made available by the Federal Reserve Bank of Philadelphia, and     can be found     \nhere\n     (series \nINFCPI10YR\n from the linked spreadsheet). Alternatively, it can be found as series     \nASACX10@SURVEYS\n via Haver Analytics.\nThe \n10-year Treasury Yield\n (zero-coupon, continuously compounded) series is made     available by the Board of Governors of the Federal Reserve System, and can be found     \nhere\n (series \nSVENY10\n     from the linked spreadsheet). Alternatively, it can be found as series \nFYCCZA@DAILY\n via Haver     Analytics. For more details on the series, seeGurkaynak, Refet S., Brian Sack, and Jonathan H. Wright. \"The U.S. Treasury Yield Curve:\n1961 to the Present.\" Journal of Monetary Economics 54.8 (2007): 2291-2304.For additional details on the series, including mnemonics and transformations used, please see Appendix A.I ofDel Negro, Marco, Marc P. Giannoni, and Frank Schorfheide. \"Inflation in the\nGreat Recession and New Keynesian Models.\" American Economic Journal:\nMacroeconomics 7.1 (2015): 168-196."
},

{
    "location": "frbny_data.html#Interest-Rate-Expectations-Data-1",
    "page": "FRBNY Model Input Data",
    "title": "Interest Rate Expectations Data",
    "category": "section",
    "text": "In our model (as used to compute the forecasts referenced in Liberty Street Economics posts), we treat the zero lower bound by adding anticipated policy shocks and data on the market-implied Federal Funds rate path. We do this by giving the model the market-implied Federal Funds rate path for the next n_anticipated_shocks quarters and forcing the model's interest rate path to hit those values in those quarters. Afterwards, the path is unconstrained. The model is trained on data that includes six quarters of interest rate expectations. The user is responsible for procuring interest rate expectations and appending it to the provided sample data set, as discussed in this documentation."
},

{
    "location": "frbny_data.html#Implementation-1",
    "page": "FRBNY Model Input Data",
    "title": "Implementation",
    "category": "section",
    "text": "If you are able to access data on the market-implied FFR path (or another form of interest rate expectations), you can augment the sample dataset or your own dataset to enable the anticipated policy shocks feature. We use internal data from the Federal Reserve Board on the implied Federal Funds Rate derived from OIS quotes. (One could also use interest rate expectations from Blue Chip Financial Forecasts or Survey of Professional Forecasters.)Step 1. Choose a value for n_anticipated_shocks (we suggest 6):m <= Setting(:n_anticipated_shocks, 6, true, \"nant\", \"Number of ant. pol. shocks\")Step 2. Add implied FFR data to the data matrix:2a. Append n_anticipated_shocks columns of NaN values to the end of the        data matrix.2b. Construct a matrix of data, say ImpliedFFR, on anticipated policy        shocks. DefineFor t from first quarter ZLB binds to last quarter ZLB binds\n   For h from 1 quarter ahead to n_anticipated_shocks quarters ahead\n       ImpliedFFR[t,h] := FFR at horizon h quarters ahead implied as of quarter t.\n   End\nEnd2c. Fill in the data matrix with the ImpliedFFR matrix. The first    row of the ImpliedFFR matrix should go in the row of the data matrix in    which the ZLB first bound and the last row of the ImpliedFFR matrix should    go in the row of the data matrix in which the ZLB last bound.Step 3. With your updated input data matrix, the code will add the appropriate   number of states, shocks, equilibrium condition equations, and measurement   equations."
},

{
    "location": "frbny_data.html#Discussion-1",
    "page": "FRBNY Model Input Data",
    "title": "Discussion",
    "category": "section",
    "text": "The implementation of anticipated policy shocks may not be immediately clear. Consider the following made-up data matrix:t GDP FFR Inf ... Spread ImpFFR_1 ... ImpFFR_H\n1960Q1 2.5 5.0 2.5 ... 1.5 NaN ... NaN\n1960Q2 2.2 5.2 1.5 ... 1.3 NaN ... NaN\n... ... ... ... ... ... ... ... ...\n2008Q3 1.1 2.2 1.0 ... 1.5 NaN ... NaN\n2008Q4 -4.5 2.0 2.0 ... 1.3 1.0 ... 1.5\n... ... ... ... ... ... ... ... ...\n2013Q1 2.2 0.2 1.7 ... 1.7 0.2 ... 1.5\n2013Q2 2.3 0.2 1.8 ... 1.6 0.2 ... 1.4Interpret this as follows:For periods before 2008Q4, there was no forward guidance or ZLB to enforce,   and we have no implied FFR values to enter.\nIn 2008Q4, actual FFR (made-up) was 2.2. Market prices \nimplied\n that markets   expected an interest rate of 1.0 in 2009Q1 \n–\n 1 period from now \n–\n   and 1.5 \nn_anticipated_shocks\n periods from 2008Q4.\nIn 2013Q2, actual FFR (made-up) was 0.2. Markets expected FFR to remain at 0.2   in 2013Q3, ..., and expected FFR of 1.4 \nn_anticipated_shocks\n periods from   2013Q2."
},

{
    "location": "frbny_data.html#References-1",
    "page": "FRBNY Model Input Data",
    "title": "References",
    "category": "section",
    "text": "For a more comprehensive treatment of anticipated policy shocks, see NY Fed Staff Report The FRBNY DSGE Model - page 12, for how the anticipated policy shocks are incorporated into the   monetary policy rule, - page 16, for how the anticipated policy shocks entered the log-linear   equilibrium conditions, - page 18, for how the anticipated policy shocks and data on market expectations   enter the measurement equation, - page 23, for how the anticipated policy shocks propagate through the model.For more in depth discussion of anticipated policy shocks/forward guidance and the impact on the macroeconomy, see NY Fed Working Paper The Forward Guidance Puzzle by Marco Del Negro, Marc Giannoni, and Christina Patterson.Thanks to Matthew Cocci for the Discussion."
},

{
    "location": "frbny_data.html#Disclaimer-1",
    "page": "FRBNY Model Input Data",
    "title": "Disclaimer",
    "category": "section",
    "text": "The sample input data provided with DSGE.jl is made available for purposes of demonstrating the function of the model only. By using the data you acknowledge and agree to the following terms and conditions. If you do not agree to these terms and conditions, do not use the data provided with the model.Some data provided with DSGE.jl may be copyrighted by its owner, and permission to use such copyrighted materials other than to demonstrate the functioning of DSGE.jl for your personal use must be obtained from the owner. The Federal Reserve Bank of New York cannot provide permission to use the data other than as permitted in this agreement.You may not use the name of the Federal Reserve Bank of New York to endorse or promote products derived from the use of the data provided with DSGE.jl, nor for any other commercial purpose.The Federal Reserve Bank of New York does not guarantee the completeness or accuracy of the data and does not provide updates or corrections to the data provided with the model. By downloading and using the data, you acknowledge and agree that your use of the data is at your own risk and that none of the parties involved in creating, producing or delivering DSGE.jl is liable for any loss, injury, claim, liability or damage of any kind resulting in any way from: (a) any errors in or omissions from the data; (b) your use of the data or any conclusions you draw from it, regardless of whether you received any assistance from the Federal Reserve Bank of New York or its employees with regard to the data; or (c) the files containing the data or use of the website from which the data files were downloaded, including anything caused by any viruses, bugs or malfunctions.ALL DATA AND MATERIALS ARE PROVIDED ON AN \"AS IS\", \"AS AVAILABLE\" BASIS WITHOUT WARRANTY OF ANY KIND. THE FEDERAL RESERVE BANK OF NEW YORK EXPRESSLY DISCLAIMS ALL WARRANTIES EXPRESS AND IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUALITY AND NON-INFRINGEMENT. NEITHER THE FEDERAL RESERVE BANK OF NEW YORK NOR ANY EMPLOYEE OR AFFILIATE SHALL BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, BUSINESS INTERRUPTION, LOSS OF INFORMATION, OR ATTORNEYS' FEES) IN ANY WAY DUE TO, RESULTING FROM OR ARISING IN CONNECTION WITH THE USE OR PERFORMANCE OF, OR INABILITY TO USE DATA OR MATERIALS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, AND REGARDLESS OF THE NEGLIGENCE OF THE BANK OR ANY EMPLOYEE OR AFFILIATE, EVEN IF THE FEDERAL RESERVE BANK OF NEW YORK HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.Reference to any specific commercial product, process or service does not constitute or imply its endorsement, recommendation or favoring by the Federal Reserve Bank of New York.Company and product names mentioned in connection with the data remain the trademark and property of their respective owners."
},

{
    "location": "implementation_details.html#",
    "page": "Implementation Details",
    "title": "Implementation Details",
    "category": "page",
    "text": ""
},

{
    "location": "implementation_details.html#Implementation-Details-1",
    "page": "Implementation Details",
    "title": "Implementation Details",
    "category": "section",
    "text": "CurrentModule = DSGEThis section describes important functions and implementation features in greater detail. If the user is interested only in running the default model and reproducing the estimation results, this section can be ignored. Additional documentation can also be found in function documentation or in-line.This section focuses on what the code does and why.  Docstrings and the code itself (including comments) provides detailed information regarding how these basic procedures are implemented."
},

{
    "location": "implementation_details.html#DSGE.Model990",
    "page": "Implementation Details",
    "title": "DSGE.Model990",
    "category": "Type",
    "text": "Model990{T} <: AbstractModel{T}\n\nThe Model990 type defines the structure of the FRBNY DSGE model.\n\nFields\n\nParameters and Steady-States\n\nparameters::Vector{AbstractParameter}\n: Vector of all time-invariant model parameters.\n\nsteady_state::Vector{AbstractParameter}\n: Model steady-state values, computed as a function of elements of   \nparameters\n.\n\nkeys::Dict{Symbol,Int}\n: Maps human-readable names for all model parameters and   steady-states to their indices in \nparameters\n and \nsteady_state\n.\n\nInputs to Measurement and Equilibrium Condition Equations\n\nThe following fields are dictionaries that map human-readible names to row and column indices in the matrix representations of of the measurement equation and equilibrium conditions.\n\nendogenous_states::Dict{Symbol,Int}\n: Maps each state to a column in the measurement and   equilibrium condition matrices.\n\nexogenous_shocks::Dict{Symbol,Int}\n: Maps each shock to a column in the measurement and   equilibrium condition matrices.\n\nexpected_shocks::Dict{Symbol,Int}\n: Maps each expected shock to a column in the   measurement and equilibrium condition matrices.\n\nequilibrium_conditions::Dict{Symbol,Int}\n: Maps each equlibrium condition to a row in the   model's equilibrium condition matrices.\n\nendogenous_states_augmented::Dict{Symbol,Int}\n: Maps lagged states to their columns in   the measurement and equilibrium condition equations. These are added after Gensys solves the   model.\n\nobservables::Dict{Symbol,Int}\n: Maps each observable to a row in the model's measurement   equation matrices.\n\nModel Specifications and Settings\n\nspec::AbstractString\n: The model specification identifier, \"m990\", cached here for   filepath computation.\n\nsubspec::AbstractString\n: The model subspecification number, indicating that some   parameters from the original model spec (\"ss0\") are initialized differently. Cached here for   filepath computation.\n\nsettings::Dict{Symbol,Setting}\n: Settings/flags that affect computation without changing   the economic or mathematical setup of the model.\n\ntest_settings::Dict{Symbol,Setting}\n: Settings/flags for testing mode\n\nOther Fields\n\nrng::MersenneTwister\n: Random number generator. Can be is seeded to ensure   reproducibility in algorithms that involve randomness (such as Metropolis-Hastings).\n\ntesting::Bool\n: Indicates whether the model is in testing mode. If \ntrue\n, settings from   \nm.test_settings\n are used in place of those in \nm.settings\n.\n\ndata_series::Dict{Symbol,Vector{Symbol}}\n: A dictionary that   stores data sources (keys) and lists of series mnemonics   (values). DSGE.jl will fetch data from the Federal Reserve Bank of   St. Louis's FRED database; all other data must be downloaded by the   user. See \nload_data\n for further details.\n\n\n\n"
},

{
    "location": "implementation_details.html#The-AbstractModel-Type-and-the-Model-Object-1",
    "page": "Implementation Details",
    "title": "The AbstractModel Type and the Model Object",
    "category": "section",
    "text": "The AbstractModel type provides a common interface for all model objects, which greatly facilitates the implementation of new model specifications. Any concrete subtype of AbstractModel can be passed to any function defined for AbstractModel, provided that the concrete type has the fields that the function expects to be available.Model990 is one example of a concrete subtype of AbstractModel that implements a single specification of the FRBNY DSGE model. All model objects must have these fields so that the interface for AbstractModel objects works correctly.  See Editing or Extending a Model for more detail.Model990"
},

{
    "location": "implementation_details.html#Defining-Indices-1",
    "page": "Implementation Details",
    "title": "Defining Indices",
    "category": "section",
    "text": "The model's equilibrium conditions and observables are represented as fairly large matrices, and keeping track of which rows and columns correspond to which states, shocks, equations, etc. can be confusing. To improve clarity, we define several dictionaries that map variable names to indices in these matrices:endogenous_states\n: Indices of endogenous model states\nexogenous_shocks\n: Indices of exogenous shocks\nexpected_shocks\n: Indices of expectation shocks\nequilibrium_conditions\n: Indices of equilibrium condition equations\nendogenous_states_augmented\n: Indices of model states, after model solution   and system augmentation\nobservables\n:  Indices of named observablesThis approach has a number of advantages. Most importantly, it is robust to inadvertent typos or indexing errors. Since the actual index number doesn't matter to us, the user only needs to define the names of their equilibrium conditions, states, and other variables. Adding states is easy - we have only to add them to the appropriate list in the model constructor, and they will be assigned an index.As an example, consider the model's equilibrium conditions. The canonical representation of the equilibrium conditions isΓ0 s_t = Γ1 s_{t-1} + C + Ψ ε_t + Π η_twhere Γ0, Γ1, C, Ψ, and Π are matrices of coefficients for s_t (states at time t), s_{t-1} (lagged states), ε_t (exogenous shocks) and η_t (expectational shocks). Each row of these matrices corresponds to an equilibrium condition, which we define using a descriptive name (for example, we name the consumption Euler equation :euler). States (columns of Γ0 and Γ1), exogenous shocks (columns of Ψ), and expectational shocks (columns Π) also have names."
},

{
    "location": "implementation_details.html#DSGE.UnscaledParameter",
    "page": "Implementation Details",
    "title": "DSGE.UnscaledParameter",
    "category": "Type",
    "text": "UnscaledParameter{T<:Number,U<:Transform} <: Parameter{T,U}\n\nTime-invariant model parameter whose value is used as-is in the model's equilibrium conditions.\n\nFields\n\nkey::Symbol\n: Parameter name. For maximum clarity, \nkey\n   should conform to the guidelines established in the DSGE Style Guide.\nvalue::T\n: Parameter value. Initialized in model space (guaranteed   to be between \nvaluebounds\n), but can be transformed between model   space and the real line via calls to \ntransform_to_real_line\n and \ntransform_to_model_space\n.\nvaluebounds::Interval{T}\n: Bounds for the parameter's value in model space.\ntransform_parameterization::Interval{T}\n: Parameters used to   transform \nvalue\n between model space and the real line.\ntransform::U\n: Transformation used to transform \nvalue\n between   model space and real line.\nprior::NullablePrior\n: Prior distribution for parameter value.\nfixed::Bool\n: Indicates whether the parameter's value is fixed rather than estimated.\ndescription::AbstractString\n:  A short description of the parameter's economic   significance.\ntex_label::AbstractString\n: String for printing the parameter name to LaTeX.\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.SteadyStateParameter",
    "page": "Implementation Details",
    "title": "DSGE.SteadyStateParameter",
    "category": "Type",
    "text": "SteadyStateParameter{T} <: AbstractParameter{T}\n\nSteady-state model parameter whose value depends upon the value of other (non-steady-state) Parameters. SteadyStateParameters must be constructed and added to an instance of a model object m _after_ all other model Parameters have been defined. Once added to m, SteadyStateParameters are stored in m.steady_state. Their values are calculated and set by steadystate!(m), rather than being estimated directly. SteadyStateParameters do not require transformations from the model space to the real line or scalings for use in equilibrium conditions.\n\nFields\n\nkey::Symbol\n: Parameter name. Should conform to the guidelines   established in the DSGE Style Guide.\nvalue::T\n: The parameter's steady-state value.\ndescription::AbstractString\n: Short description of the parameter's economic significance.\ntex_label::AbstractString\n: String for printing parameter name to LaTeX.\n\n\n\nSteadyStateParameter{T<:Number}(key::Symbol, value::T;\n                                description::AbstractString = \"\",\n                                tex_label::AbstractString = \"\")\n\nSteadyStateParameter constructor with optional description and tex_label arguments.\n\n\n\n"
},

{
    "location": "implementation_details.html#Parameters:-The-AbstractParameter-Type-1",
    "page": "Implementation Details",
    "title": "Parameters: The AbstractParameter Type",
    "category": "section",
    "text": "The AbstractParameter type implements our notion of a model parameter: a time-invariant, unobserved value that has economic significance in the model's equilibrium conditions. We estimate the model to find the values of these parameters.Though all parameters are time-invariant, each has different features. Some parameters are scaled for use in the model's equilibrium conditions and measurement equations.  During optimization, parameters can be transformed from model space to the real line via one of three different transformations. These transformations are also defined as types, and require additional information for each parameter. Finally, steady-state parameters are not estimated directly, but are calculated as a function of other parameters.These various requirements are nicely addressed using a parameterized type hierarchy.AbstractParameter{T<:Number}\n: The common abstract supertype for all   parameters.     - \nParameter{T<:Number, U<:Transform}\n: The abstract supertype for       parameters that are directly estimated.         - \nUnscaledParameter{T<:Number, U:<Transform}\n: Concrete type for           parameters that do not need to be scaled for equilibrium conditions.         - \nScaledParameter{T<:Number, U:<Transform}\n: Concrete type for           parameters that are scaled for equilibrium conditions.     - \nSteadyStateParameter{T<:Number}\n: Concrete type for steady-state       parameters.All Parameters have the fields defined in UnscaledParameter:UnscaledParameterScaledParameters also have the following fields:scaledvalue::T\n: Parameter value scaled for use in \neqcond.jl\nscaling::Function\n: Function used to scale parameter value for use in   equilibrium conditions.Note: Though not strictly necessary, defining a scaling with the parameter object allows for much a much cleaner definition of the equilibrium conditions.Because the values of SteadyStateParameters are directly computed as a function of ScaledParameters and UnscaledParameters, they only require 4 fields:SteadyStateParameter"
},

{
    "location": "implementation_details.html#DSGE.Setting",
    "page": "Implementation Details",
    "title": "DSGE.Setting",
    "category": "Type",
    "text": "Setting{T}\n\nThe Setting type is an interface for computational settings that affect how the code runs without affecting the mathematical definition of the model. It also provides support for non-conflicting file names for output of 2 models that differ only in the values of their computational settings.\n\nFields\n\nkey::Symbol\n: Name of setting\nvalue::T\n: Value of setting\nprint::Bool\n: Indicates whether to append this setting's code and value to output file   names. If true, output file names will include a suffix of the form \n_code1=val1_code2=val2\n   etc. where codes are listed in alphabetical order.\ncode::AbstractString\n: string of <=4 characters to print to output file suffixes when   \nprint=true\n.\ndescription::AbstractString\n: Short description of what the setting is used for.\n\n\n\n"
},

{
    "location": "implementation_details.html#Model-Settings-1",
    "page": "Implementation Details",
    "title": "Model Settings",
    "category": "section",
    "text": "The Setting type implements computational settings that affect how the code runs without affecting the mathematical definition of the model. These include flags (e.g. whether or not to recompute the Hessian), parameterization for the Metropolis-Hastings algorithm (e.g. number of times to draw from the posterior distribution), and the vintage of data being used (Setting is a parametric type - a Setting{T<:Any}, so Booleans, Numbers, and Strings can all be turned into Settings). They are stored centrally in the settings dictionary within the model object.Why implement a Setting type when we could put their values directly into the source code or dictionary? The most obvious answer is that the parametric type allows us to implement a single interface for all Settings (Booleans, Strings, etc.), so that when we access a particular setting during the estimation and forecast steps, we don't have to think about the setting's type.Settings play an important role in addition to providing useful abstraction. Estimating and forecasting the FRBNY DSGE model takes many hours of computation time and creates a lot of output files. It is useful to be able to compare model output from two different models whose settings differ slightly (for example, consider two identical models that use different vintages of data as input). A central feature of the Setting type is a mechanism that generates unique, meaningful filenames when code is executed with different settings. Specifically, when a setting takes on a non-default value, a user-defined setting code (along with the setting's value) are appended to all output files generated during execution.The Setting{T<:Any} type is defined as follows:SettingTo update the value of an existing function, the user has two options. First, the user may use the <= syntax as shown in the Running with Default Settings section. However, for this to work properly, it is essential that the setting's key field be exactly the same as that of an existing entry in m.settings. Otherwise, an additional entry will be added to m.settings and the old setting will be the one accessed from other all routines. A potentially safer, though clunkier, option is to use the update! method."
},

{
    "location": "implementation_details.html#Type-Interfaces-1",
    "page": "Implementation Details",
    "title": "Type Interfaces",
    "category": "section",
    "text": ""
},

{
    "location": "implementation_details.html#DSGE.update!",
    "page": "Implementation Details",
    "title": "DSGE.update!",
    "category": "Function",
    "text": "update!{T}(pvec::ParameterVector{T}, values::Vector{T})\n\nUpdate all parameters in pvec that are not fixed with values. Length of values must equal length of pvec.\n\n\n\nupdate!{T<:AbstractFloat}(m::AbstractModel, values::Vector{T})\n\nUpdate m.parameters with values, recomputing the steady-state parameter values.\n\nArguments:\n\nm\n: the model object\nvalues\n: the new values to assign to non-steady-state parameters.\n\n\n\nupdate!(a::Setting, b::Setting)\n\nUpdate a with the fields of b if:\n\nThe \nkey\n field is updated if \na.key == b.key\n \nThe \nprint\n boolean and \ncode\n string are overwritten if \na.print\n is false and   \nb.print\n is true, or \na.print\n is true, \nb.print\n is false, and   b.code is non-empty.\nThe \ndescription\n field is updated if \nb.description\n is nonempty\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.transform_to_model_space!",
    "page": "Implementation Details",
    "title": "DSGE.transform_to_model_space!",
    "category": "Function",
    "text": "transform_to_model_space!{T<:AbstractFloat}(m::AbstractModel, values::Vector{T})\n\nTransforms values from the real line to the model space, and assigns values[i] to m.parameters[i].value for non-steady-state parameters. Recomputes the steady-state paramter values.\n\nArguments\n\nm\n: the model object\nvalues\n: the new values to assign to non-steady-state parameters.\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.load_parameters_from_file",
    "page": "Implementation Details",
    "title": "DSGE.load_parameters_from_file",
    "category": "Function",
    "text": "load_parameters_from_file(m::AbstractModel,path::AbstractString)\n\nReturns a vector of parameters, read from a file, suitable for updating m.\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.specify_mode!",
    "page": "Implementation Details",
    "title": "DSGE.specify_mode!",
    "category": "Function",
    "text": "specify_mode!(m::AbstractModel, mode_file::AbstractString=\"\"; verbose=:low)\n\nUpdates the values of m.parameters with the values from mode_file. Sets reoptimize setting to false.\n\nUsage: should be run before calling estimate(m), e.g.:\n\nm = Model990()\nspecify_mode!(m, modefile)\nestimate(m)\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.specify_hessian",
    "page": "Implementation Details",
    "title": "DSGE.specify_hessian",
    "category": "Function",
    "text": "specify_hessian(m::AbstractModel, path::AbstractString=\"\"; verbose=:low)\n\nSpecify a Hessian matrix calculated at the posterior mode to use in the model estimation. If no path is provided, will attempt to detect location.\n\n\n\n"
},

{
    "location": "implementation_details.html#AbstractModel-Interface-1",
    "page": "Implementation Details",
    "title": "AbstractModel Interface",
    "category": "section",
    "text": "DSGE.update!\nDSGE.transform_to_model_space!\nDSGE.load_parameters_from_file\nDSGE.specify_mode!\nDSGE.specify_hessian"
},

{
    "location": "implementation_details.html#DSGE.parameter",
    "page": "Implementation Details",
    "title": "DSGE.parameter",
    "category": "Function",
    "text": "parameter{T,U<:Transform}(key::Symbol, value::T, valuebounds = (value,value),\n                          transform_parameterization = (value,value),\n                          transform = Untransformed(), prior = NullablePrior(),\n                          fixed = true, scaling::Function = identity, description = \"\",\n                          tex_label::AbstractString = \"\")\n\nBy default, returns a fixed UnscaledParameter object with key key and value value. If scaling is given, a ScaledParameter object is returned.\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.parameter-Tuple{DSGE.ScaledParameter{T<:Number,U<:DSGE.Transform},T<:Number}",
    "page": "Implementation Details",
    "title": "DSGE.parameter",
    "category": "Method",
    "text": "parameter{T<:Number,U<:Transform}(p::ScaledParameter{T,U}, newvalue::T)\n\nReturns a ScaledParameter with value field equal to newvalue and scaledvalue field equal to p.scaling(newvalue). If p is a fixed parameter, it is returned unchanged.\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.parameter-Tuple{DSGE.UnscaledParameter{T<:Number,U<:DSGE.Transform},T<:Number}",
    "page": "Implementation Details",
    "title": "DSGE.parameter",
    "category": "Method",
    "text": "parameter{T<:Number,U<:Transform}(p::UnscaledParameter{T,U}, newvalue::T)\n\nReturns an UnscaledParameter with value field equal to newvalue. If p is a fixed parameter, it is returned unchanged.\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.transform_to_model_space-Tuple{DSGE.Parameter{T,DSGE.Untransformed},T}",
    "page": "Implementation Details",
    "title": "DSGE.transform_to_model_space",
    "category": "Method",
    "text": "transform_to_model_space{T<:Number, U<:Transform}(p::Parameter{T,U}, x::T)\n\nTransforms x from the real line to lie between p.valuebounds without updating p.value. The transformations are defined as follows, where (a,b) = p.transform_parameterization and c a scalar (default=1):\n\nUntransformed: \nx\nSquareRoot:    \n(a+b)/2 + (b-a)/2 * c * x/sqrt(1 + c^2 * x^2)\nExponential:   \na + exp(c*(x-b))\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.transform_to_real_line",
    "page": "Implementation Details",
    "title": "DSGE.transform_to_real_line",
    "category": "Function",
    "text": "transform_to_real_line{T<:Number, U<:Transform}(p::Parameter{T,U}, x::T = p.value)\n\nTransforms p.value from model space (between p.valuebounds) to the real line, without updating p.value. The transformations are defined as follows, where (a,b) = p.transform_parameterization, c a scalar (default=1), and x = p.value:\n\nUntransformed: x\nSquareRoot:   (1/c)*cx/sqrt(1 - cx^2), where cx =  2 * (x - (a+b)/2)/(b-a)\nExponential:   a + exp(c*(x-b))\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.update!-Tuple{Array{DSGE.AbstractParameter{T},1},Array{T,1}}",
    "page": "Implementation Details",
    "title": "DSGE.update!",
    "category": "Method",
    "text": "update!{T}(pvec::ParameterVector{T}, values::Vector{T})\n\nUpdate all parameters in pvec that are not fixed with values. Length of values must equal length of pvec.\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.update-Tuple{Array{DSGE.AbstractParameter{T},1},Array{T,1}}",
    "page": "Implementation Details",
    "title": "DSGE.update",
    "category": "Method",
    "text": "update{T}(pvec::ParameterVector{T}, values::Vector{T})\n\nReturns a copy of pvec where non-fixed parameter values are updated to values. pvec remains unchanged. Length of values must equal length of pvec.\n\n\n\n"
},

{
    "location": "implementation_details.html#Parameter-Interface-1",
    "page": "Implementation Details",
    "title": "Parameter Interface",
    "category": "section",
    "text": "Modules = [DSGE]\nPages = [\"parameters.jl\"]\nOrder = [:function]"
},

{
    "location": "implementation_details.html#DSGE.default_test_settings!-Tuple{DSGE.AbstractModel{T}}",
    "page": "Implementation Details",
    "title": "DSGE.default_test_settings!",
    "category": "Method",
    "text": "default_test_settings!(m::AbstractModel)\n\nThe following Settings are constructed, initialized and added to m.test_settings. Their purposes are identical to those in m.settings, but these values are used to test DSGE.jl.\n\nI/O Locations and identifiers\n\nsaveroot::Setting{ASCIIString}\n: A temporary directory in /tmp/\ndataroot::Setting{ASCIIString}\n: dsgeroot/test/reference/\ndata_vintage::Setting{ASCIIString}\n: \"_REF\"\n\nMetropolis-Hastings\n\nn_mh_simulations::Setting{Int}\n: 100\nn_mh_blocks::Setting{Int}\n: 1\nn_mh_burn::Setting{Int}\n: 0\nmh_thin::Setting{Int}\n: 1\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.get_setting-Tuple{DSGE.AbstractModel{T},Symbol}",
    "page": "Implementation Details",
    "title": "DSGE.get_setting",
    "category": "Method",
    "text": "get_setting(m::AbstractModel, setting::Symbol)\n\nReturns the value of the setting\n\n\n\n"
},

{
    "location": "implementation_details.html#DSGE.update!-Tuple{DSGE.Setting{T},DSGE.Setting{T}}",
    "page": "Implementation Details",
    "title": "DSGE.update!",
    "category": "Method",
    "text": "update!(a::Setting, b::Setting)\n\nUpdate a with the fields of b if:\n\nThe \nkey\n field is updated if \na.key == b.key\n \nThe \nprint\n boolean and \ncode\n string are overwritten if \na.print\n is false and   \nb.print\n is true, or \na.print\n is true, \nb.print\n is false, and   b.code is non-empty.\nThe \ndescription\n field is updated if \nb.description\n is nonempty\n\n\n\n"
},

{
    "location": "implementation_details.html#Base.<=-Tuple{DSGE.AbstractModel{T},DSGE.Setting{T}}",
    "page": "Implementation Details",
    "title": "Base.<=",
    "category": "Method",
    "text": "(<=)(m::AbstractModel, s::Setting)\n\nSyntax for adding a setting to a model/overwriting a setting via m <= Setting(...)\n\n\n\n"
},

{
    "location": "implementation_details.html#Setting-Interface-1",
    "page": "Implementation Details",
    "title": "Setting Interface",
    "category": "section",
    "text": "Modules = [DSGE]\nPages = [\"settings.jl\"]\nOrder = [:function]"
},

{
    "location": "solving.html#",
    "page": "Solving the Model",
    "title": "Solving the Model",
    "category": "page",
    "text": ""
},

{
    "location": "solving.html#Solving-the-Model-1",
    "page": "Solving the Model",
    "title": "Solving the Model",
    "category": "section",
    "text": ""
},

{
    "location": "solving.html#DSGE.solve",
    "page": "Solving the Model",
    "title": "DSGE.solve",
    "category": "Function",
    "text": "solve(m::AbstractModel)\n\nDriver to compute the model solution and augment transition matrices.\n\nArguments\n\nm\n: the model object\n\nReturn values\n\nTTT, RRR, and CCC matrices of the state transition equation:     ```     S_t = TTT\nS_{t-1} + RRR\nϵ_t + CCC     ```\n\n\n\n"
},

{
    "location": "solving.html#The-gensys-routine-1",
    "page": "Solving the Model",
    "title": "The gensys routine",
    "category": "section",
    "text": "The DSGE model is written down in its canonical representation:Γ0 s_t = Γ1 s_{t-1} + C + Ψ ε_t + Π η_twhere Γ0, Γ1, C, Ψ, and Π are matrices of coefficients for s_t (states at time t), s_{t-1} (lagged states), ε_t (exogenous shocks) and η_t (expectational shocks).DSGE.jl solves the model to obtain its state-space form using the gensys routine of Chris Sims, introduced in this paper. We provide a standalone native Julia implementation of the routine (gensys) as well as a wrapper for AbstractModel subtypes (solve):When the Gensys.jl package becomes ready for use, we intend to deprecate our gensys code and substitute the gensysdt method for our code.DSGE.solve"
},

{
    "location": "estimation.html#",
    "page": "Estimating the Model",
    "title": "Estimating the Model",
    "category": "page",
    "text": ""
},

{
    "location": "estimation.html#Estimation-1",
    "page": "Estimating the Model",
    "title": "Estimation",
    "category": "section",
    "text": "CurrentModule = DSGE"
},

{
    "location": "estimation.html#DSGE.estimate",
    "page": "Estimating the Model",
    "title": "DSGE.estimate",
    "category": "Function",
    "text": "estimate(m, data; verbose=:low, proposal_covariance=Matrix())\n\nEstimate the DSGE parameter posterior distribution.\n\nArguments:\n\nm::AbstractModel\n: model object\n\nOptional Arguments:\n\ndata\n: well-formed data as \nMatrix\n or \nDataFrame\n. If this is not provided, the \nload_data\n routine will be executed.\n\nKeyword Arguments:\n\nverbose::Symbol\n: The desired frequency of function progress messages printed to standard out.\n:none\n: No status updates will be reported.\n:low\n: Status updates will be provided in csminwel and at each block in      Metropolis-Hastings.\n:high\n: Status updates provided at each iteration in Metropolis-Hastings.\nproposal_covariance::Matrix\n: Used to test the metropolis_hastings algorithm with a precomputed   covariance matrix for the proposal distribution. When the Hessian is singular,   eigenvectors corresponding to zero eigenvectors are not well defined, so eigenvalue   decomposition can cause problems. Passing a precomputed matrix allows us to ensure that   the rest of the routine has not broken. \n\n\n\n"
},

{
    "location": "estimation.html#Procedure-1",
    "page": "Estimating the Model",
    "title": "Procedure",
    "category": "section",
    "text": "The goal of the estimation step is to sample from the posterior distribution of the model parameters. DSGE.jl uses a Metropolis-Hastings sampler to do this, which requires as a proposal covariance matrix the Hessian matrix corresponding to the posterior mode. The function estimate implements the entire procedure. Main Steps:Initialization\n: Read in and transform raw data from \nsave/input_data/\n. See \nInput Data\n for more details.  Reoptimize parameter vector\n: The main program will call the \ncsminwel\n   optimization routine (located in \ncsminwel.jl\n) to find modal parameter   estimates.Compute Hessian matrix\n: Computing the Hessian matrix to scale the   proposal distribution in the Metropolis-Hastings algorithm.Sample from Posterior\n: Posterior sampling is performed using the   Metropolis-Hastings algorithm. A proposal distribution is constructed centered   at the posterior mode and with proposal covariance scaled by the inverse of   the Hessian matrix. Settings for the number of sampling blocks and the size of   those blocks can be altered as described in   \nEditing or Extending a Model\n.Remark: In addition to saving each mh_thin-th draw of the parameter vector, the estimation program also saves the resulting posterior value and transition equation matrices implied by each draw of the parameter vector. This is to save time in the forecasting step since that code can avoid recomputing those matrices.To run the entire procedure, the user simply calls the estimate routine:DSGE.estimate"
},

{
    "location": "estimation.html#Computing-the-Posterior-1",
    "page": "Estimating the Model",
    "title": "Computing the Posterior",
    "category": "section",
    "text": "In DSGE.jl, the function posterior computes the value of the posterior distribution at a given parameter vector. It calls the likelihood function, which in turn calls the kalman_filter routine. See Estimation routines for more details on these functions.We implement the Kalman Filter via the kalman_filter function to compute the log-likelihood, and add this to the log prior to obtain the log posterior. See State Space Routines for a model-independent implementations of the Kalman filter.	"
},

{
    "location": "estimation.html#estimation-reoptimizing-1",
    "page": "Estimating the Model",
    "title": "Optimizing or Reoptimizing",
    "category": "section",
    "text": "Generally, the user will want to reoptimize the parameter vector (and consequently, calculate the Hessian at this new mode) every time they conduct posterior sampling; that is, when:the input data are updated with a new quarter of observations or revised\nthe model sub-specification is changed\nthe model is derived from an existing model with different equilibrium conditions or   measurement equation.This behavior can be controlled more finely."
},

{
    "location": "estimation.html#Reoptimize-from-a-Specified-Starting-Vector-1",
    "page": "Estimating the Model",
    "title": "Reoptimize from a Specified Starting Vector",
    "category": "section",
    "text": "Reoptimize the model starting from the parameter values supplied in a specified file. Ensure that you supply an HDF5 file with a variable named params that is the correct dimension and data type.m = Model990()\nparams = load_parameters_from_file(m, \"path/to/parameter/file.h5\")\nupdate!(m, params)\nestimate(m)"
},

{
    "location": "estimation.html#Skip-Reoptimization-Entirely-1",
    "page": "Estimating the Model",
    "title": "Skip Reoptimization Entirely",
    "category": "section",
    "text": "You can provide a modal parameter vector and optionally a Hessian matrix calculated at that mode to skip the reoptimization entirely. These values are usually computed by the user previously.You can skip reoptimization of the parameter vector entirely.m = Model990()\nspecify_mode!(m, \"path/to/parameter/mode/file.h5\")\nestimate(m)The specify_mode! function will update the parameter vector to the mode and skip reoptimization by setting the reoptimize model setting. Ensure that you supply an HDF5 file with a variable named params that is the correct dimension and data type. (See also the utility function load_parameters_from_file.)"
},

{
    "location": "estimation.html#Calculating-the-Hessian-1",
    "page": "Estimating the Model",
    "title": "Calculating the Hessian",
    "category": "section",
    "text": "By default, estimate will recompute the Hessian matrix. You can skip calculation of the Hessian matrix entirely if you provide a file with a Hessian that has been pre-computed.m = Model990()\nspecify_mode!(m, \"path/to/parameter/mode/file.h5\")\nspecify_hessian(m, \"path/to/Hessian/matrix/file.h5\")\nestimate(m)The specify_hessian function will cause estimate to read in the Hessian matrix rather than calculating it directly.  Ensure that you supply an HDF5 file with a variable named hessian that is the correct dimension and data type. Specifying the Hessian matrix but not the parameter mode results in undefined behavior.See [Hessian Approximation] for more details on the Hessian computation. "
},

{
    "location": "estimation.html#Estimation-routines-1",
    "page": "Estimating the Model",
    "title": "Estimation routines",
    "category": "section",
    "text": ""
},

{
    "location": "estimation.html#DSGE.prior",
    "page": "Estimating the Model",
    "title": "DSGE.prior",
    "category": "Function",
    "text": "prior(m::AbstractModel{T})\n\nCalculates log joint prior density of m.parameters.\n\n\n\n"
},

{
    "location": "estimation.html#DSGE.likelihood",
    "page": "Estimating the Model",
    "title": "DSGE.likelihood",
    "category": "Function",
    "text": "likelihood{T<:AbstractFloat}(m::AbstractModel, data::Matrix{T};\n                              mh::Bool = false, catch_errors::Bool = false)\n\nEvaluate the DSGE likelihood function. Can handle \"two part\" estimation where the observed sample contains both a normal stretch of time (in which interest rates are positive) and a stretch of time in which interest rates reach the zero lower bound. If there is a zero-lower-bound period, then we filter over the 2 periods separately.  Otherwise, we filter over the main sample all at once.\n\nArguments\n\nm\n: The model object\ndata\n: matrix of data for observables\n\nOptional Arguments\n\nmh\n: Whether metropolis_hastings is the caller. If \nmh=true\n, the transition matrices for   the zero-lower-bound period are returned in a dictionary.\ncatch_errors\n: If \nmh = true\n, \nGensysErrors\n should always be caught.\n\n\n\n"
},

{
    "location": "estimation.html#DSGE.posterior",
    "page": "Estimating the Model",
    "title": "DSGE.posterior",
    "category": "Function",
    "text": "posterior{T<:AbstractFloat}(m::AbstractModel{T}, data::Matrix{T};\n                             mh::Bool = false, catch_errors::Bool = false)\n\nCalculates and returns the log of the posterior distribution for m.parameters:\n\nlog posterior = log likelihood + log prior\nlog Pr(Θ|data)  = log Pr(data|Θ)   + log Pr(Θ)\n\nArguments\n\nm\n: the model object\ndata\n: matrix of data for observables\n\nOptional Arguments\n\n-mh: Whether metropolis_hastings is the caller. If mh=true, the log likelihood and the   transition matrices for the zero-lower-bound period are also returned. -catch_errors: Whether or not to catch errors of type GensysError or ParamBoundsError\n\n\n\n"
},

{
    "location": "estimation.html#DSGE.posterior!",
    "page": "Estimating the Model",
    "title": "DSGE.posterior!",
    "category": "Function",
    "text": "posterior!{T<:AbstractFloat}(m::AbstractModel{T}, parameters::Vector{T}, data::Matrix{T};\n                              mh::Bool = false, catch_errors::Bool = false)\n\nEvaluates the log posterior density at parameters.\n\nArguments\n\nm\n: The model object\nparameters\n: New values for the model parameters\ndata\n: Matrix of input data for observables\n\nOptional Arguments\n\nmh\n: Whether metropolis_hastings is the caller. If \nmh=true\n, the log likelihood and the   transition matrices for the zero-lower-bound period are also returned.\ncatch_errors\n: Whether or not to catch errors of type \nGensysError\n or \nParamBoundsError\n.   If \nmh = true\n, both should always be caught.\n\n\n\n"
},

{
    "location": "estimation.html#Prior,-Likelihood-and-Posterior-calculations-1",
    "page": "Estimating the Model",
    "title": "Prior, Likelihood and Posterior calculations",
    "category": "section",
    "text": "DSGE.prior\nDSGE.likelihood\nDSGE.posterior\nDSGE.posterior!"
},

{
    "location": "estimation.html#Optimization-1",
    "page": "Estimating the Model",
    "title": "Optimization",
    "category": "section",
    "text": "See Optimization"
},

{
    "location": "estimation.html#Full-Estimation-Routine-1",
    "page": "Estimating the Model",
    "title": "Full Estimation Routine",
    "category": "section",
    "text": "See estimate"
},

{
    "location": "estimation.html#DSGE.compute_moments",
    "page": "Estimating the Model",
    "title": "DSGE.compute_moments",
    "category": "Function",
    "text": "compute_moments(m::AbstractModel, percent::Float64 = 0.90; verbose::Symbol=:none)\n\nComputes prior and posterior parameter moments. Tabulates prior mean, posterior mean, and bands in various LaTeX tables stored tablespath(m).\n\nArguments\n\nm\n: the model object\npercent\n: the percentage of the mass of draws from Metropolis-Hastings included between   the bands displayed in output tables.\n\n\n\n"
},

{
    "location": "estimation.html#DSGE.find_density_bands-Tuple{Array{T,2},AbstractFloat}",
    "page": "Estimating the Model",
    "title": "DSGE.find_density_bands",
    "category": "Method",
    "text": "find_density_bands(draws::Matrix, percent::AbstractFloat; minimize::Bool=true)\n\nReturns a 2 x cols(draws) matrix bands such that percent of the mass of draws[:,i] is above bands[1,i] and below bands[2,i].\n\nArguments\n\ndraws\n: Matrix of parameter draws (from Metropolis-Hastings, for example)\npercent\n: percent of data within bands (e.g. .9 to get 90% of mass within bands)\n\nOptional Arguments\n\nminimize\n: if \ntrue\n, choose shortest interval, otherwise just chop off lowest and   highest (percent/2)\n\n\n\n"
},

{
    "location": "estimation.html#DSGE.make_moment_tables-Tuple{DSGE.AbstractModel{T},Array{T<:AbstractFloat,2},AbstractFloat}",
    "page": "Estimating the Model",
    "title": "DSGE.make_moment_tables",
    "category": "Method",
    "text": "make_moment_tables{T<:AbstractFloat}(m::AbstractModel, draws::Matrix{T},\n    percent::AbstractFloat; verbose::Symbol = :none)\n\nTabulates parameter moments in 3 LaTeX tables:\n\nFor MAIN parameters, a list of prior means, prior standard deviations, posterior means,    and 90% bands for posterior draws\nFor LESS IMPORTANT parameters, a list of the prior means, prior standard deviations,    posterior means and 90% bands for posterior draws.\nA list of prior means and posterior means\n\nArguments\n\ndraws\n: [n_draws x n_parameters] matrix holding the posterior draws from   Metropolis-Hastings from save/mhsave.h5\npercent\n: the mass of observations we want; 0 <= percent <= 1\n\n\n\n"
},

{
    "location": "estimation.html#DSGE.save_mean_parameters-Tuple{DSGE.AbstractModel{T},Array{T<:AbstractFloat,2}}",
    "page": "Estimating the Model",
    "title": "DSGE.save_mean_parameters",
    "category": "Method",
    "text": "save_mean_parameters{T<:AbstractFloat}(m::AbstractModel, draws::Matrix{T})\n\nComputes and saves the posterior mean of the parameters.\n\nArguments\n\nm\ndraws\n: n_draws x n_parameters matrix holding the posterior draws from   Metropolis-Hastings\n\n\n\n"
},

{
    "location": "estimation.html#Output-Analysis-1",
    "page": "Estimating the Model",
    "title": "Output Analysis",
    "category": "section",
    "text": "Modules = [DSGE]\nPages   = [\"moments.jl\"]\nOrder   = [:function, :type]"
},

{
    "location": "algorithms.html#",
    "page": "Algorithms",
    "title": "Algorithms",
    "category": "page",
    "text": ""
},

{
    "location": "algorithms.html#Standard-Algorithms-1",
    "page": "Algorithms",
    "title": "Standard Algorithms",
    "category": "section",
    "text": "CurrentModule = DSGE"
},

{
    "location": "algorithms.html#DSGE.gensys",
    "page": "Algorithms",
    "title": "DSGE.gensys",
    "category": "Function",
    "text": "gensys(Γ0, Γ1, c, Ψ, Π)\ngensys(Γ0, Γ1, c, Ψ, Π, div)\ngensys(F::Base.LinAlg.GeneralizedSchur, c, Ψ, Π)\ngensys(F::Base.LinAlg.GeneralizedSchur, c, Ψ, Π, div)\n\nGenerate state-space solution to canonical-form DSGE model.\n\nSystem given as\n\nΓ0*y(t) = Γ1*y(t-1) + c + Ψ*z(t) + Π*η(t),\n\nwith z an exogenous variable process and η being endogenously determined one-step-ahead expectational errors.\n\nReturned system is\n\ny(t) = G1*y(t-1) + C + impact*z(t) + ywt*inv(I-fmat*inv(L))*fwt*z(t+1)\n\nReturned values are\n\nG1, C, impact, fmat, fwt, ywt, gev, eu, loose\n\nIf z(t) is i.i.d., the last term drops out.\n\nIf div is omitted from argument list, a div>1 is calculated.\n\nReturn codes\n\neu[1]==1\n for existence\neu[2]==1\n for uniqueness\neu[1]==-1\n for existence only with not-s.c. z;\neu==[-2,-2]\n for coincident zeros.\n\nNotes\n\nWe constrain Julia to use the complex version of the schurfact routine regardless of the types of Γ0 and Γ1, to match the behavior of Matlab.  Matlab always uses the complex version of the Schur decomposition, even if the inputs are real numbers.\n\n\n\n"
},

{
    "location": "algorithms.html#Solving-the-Model-1",
    "page": "Algorithms",
    "title": "Solving the Model",
    "category": "section",
    "text": "gensys"
},

{
    "location": "algorithms.html#DSGE.csminwel",
    "page": "Algorithms",
    "title": "DSGE.csminwel",
    "category": "Function",
    "text": "csminwel(fcn::Function, grad::Function, x0::Vector, H0::Matrix=1e-5.*eye(length(x0)), args...;\n         xtol::Real=1e-32, ftol::Float64=1e-14, grtol::Real=1e-8, iterations::Int=1000,\n         store_trace::Bool = false, show_trace::Bool = false, extended_trace::Bool = false,\n         verbose::Symbol = :none, rng::AbstractRNG = MersenneTwister(0), kwargs...)\n\nMinimizes fcn using the csminwel algorithm.\n\nArguments\n\nfcn::Function\n : The objective function\ngrad::Function\n : The gradient of the objective function. This argument can be omitted if an analytical gradient is not available, which will cause a numerical gradient to be calculated.\nx0::Vector\n: The starting guess for the optimizer\n\nOptional Arguments\n\nH0::Matrix\n: An initial guess for the Hessian matrix \n–\n must be positive definite. If none is given, then a scaled down identity matrix is used.\nargs...\n:  Other positional arguments to be passed to \nf\n on each function call\n\nKeyword Arguments\n\nftol::{T<:Real}=1e-14\n: Threshold for convergence in terms of change in function value across iterations.\niterations::Int=100\n: Maximum number of iterations\nkwargs...\n: Other keyword arguments to be passed to \nf\n on each function call\n\n\n\n"
},

{
    "location": "algorithms.html#DSGE.optimize!",
    "page": "Algorithms",
    "title": "DSGE.optimize!",
    "category": "Function",
    "text": "optimize!(m::AbstractModel, data::Matrix;\n          method::Symbol       = :csminwel,\n          xtol::Real           = 1e-32,  # default from Optim.jl\n          ftol::Float64        = 1e-14,  # Default from csminwel\n          grtol::Real          = 1e-8,   # default from Optim.jl\n          iterations::Int      = 1000,\n          store_trace::Bool    = false,\n          show_trace::Bool     = false,\n          extended_trace::Bool = false,\n          verbose::Symbol      = :none)\n\nWrapper function to send a model to csminwel (or another optimization routine).\n\n\n\n"
},

{
    "location": "algorithms.html#algs-optimization-1",
    "page": "Algorithms",
    "title": "Optimization",
    "category": "section",
    "text": "csminwel\noptimize!"
},

{
    "location": "algorithms.html#DSGE.hessian!-Tuple{DSGE.AbstractModel{T},Array{T<:AbstractFloat,1},Array{T<:AbstractFloat,2}}",
    "page": "Algorithms",
    "title": "DSGE.hessian!",
    "category": "Method",
    "text": "hessian!{T<:AbstractFloat}(m::AbstractModel, x::Vector{T}, data::Matrix{T};\n                           verbose::Symbol = :none)\n\nCompute Hessian of DSGE posterior function evaluated at x.\n\n\n\n"
},

{
    "location": "algorithms.html#DSGE.hessizero-Tuple{Function,Array{T<:AbstractFloat,1}}",
    "page": "Algorithms",
    "title": "DSGE.hessizero",
    "category": "Method",
    "text": "hessizero{T<:AbstractFloat}(fcn::Function, x::Vector{T};\n                            check_neg_diag::Bool=false,\n                            verbose::Symbol=:none,\n                            distr::Bool=true)\n\nCompute Hessian of function fcn evaluated at x.\n\nArguments\n\ncheck_neg_diag\n: Throw an error if any negative diagonal elements are detected.\nverbose\n: Print verbose output\ndistr\n: Use available parallel workers to increase performance.\n\n\n\n"
},

{
    "location": "algorithms.html#Hessian-Approximation-1",
    "page": "Algorithms",
    "title": "Hessian Approximation",
    "category": "section",
    "text": "Modules = [DSGE]\nPages   = [\"hessian.jl\", \"hessizero.jl\"]\nOrder   = [:function, :type]"
},

{
    "location": "algorithms.html#DSGE.metropolis_hastings",
    "page": "Algorithms",
    "title": "DSGE.metropolis_hastings",
    "category": "Function",
    "text": "metropolis_hastings{T<:AbstractFloat}(propdist::Distribution, m::AbstractModel,\n    data::Matrix{T}, cc0::T, cc::T; verbose::Symbol = :low)\n\nImplements the Metropolis-Hastings MCMC algorithm for sampling from the posterior distribution of the parameters.\n\nArguments\n\npropdist\n The proposal distribution that Metropolis-Hastings begins sampling from.\nm\n: The model object\ndata\n: Data matrix for observables\ncc0\n: Jump size for initializing Metropolis-Hastings.\ncc\n: Jump size for the rest of Metropolis-Hastings.\n\nOptional Arguments\n\nverbose\n: The desired frequency of function progress messages printed to standard out.\n:none\n: No status updates will be reported.\n:low\n: Status updates provided at each block.\n:high\n: Status updates provided at each draw.\n\n\n\n"
},

{
    "location": "algorithms.html#Sampling-1",
    "page": "Algorithms",
    "title": "Sampling",
    "category": "section",
    "text": "metropolis_hastings"
},

{
    "location": "algorithms.html#DSGE.kalman_filter",
    "page": "Algorithms",
    "title": "DSGE.kalman_filter",
    "category": "Function",
    "text": "kalman_filter(data, lead, a, F, b, H, var, z0, vz0, Ny0; allout=false)\nkalman_filter(data, lead, a, F, b, H, var, Ny0=0; allout=false)\n\nInputs\n\ndata\n: a \nNy x T\n matrix containing data \ny(1), ... , y(T)\n.\nlead\n: the number of steps to forecast after the end of the data.\na\n: an \nNz x 1\n vector for a time-invariant input vector in the transition equation.\nF\n: an \nNz x Nz\n matrix for a time-invariant transition matrix in the transition   equation.\nb\n: an \nNy x 1\n vector for a time-invariant input vector in the measurement equation.\nH\n: an \nNy x Nz\n matrix for a time-invariant measurement matrix in the measurement   equation.\nvar\n: an \nNy + Nz\n x \nNy + Nz\n matrix for a time-invariant variance matrix for the   error in the transition equation and the error in the measurement equation, that is,   \n[η(t)', ϵ(t)']'\n.\nz0\n: an optional \nNz x 1\n initial state vector.\nvz0\n: an optional \nNz x Nz\n covariance matrix of an initial state vector.\nNy0\n: an optional scalar indicating the number of periods of presample (i.e. the number   of periods which we don't add to the likelihood)\nallout\n: an optional keyword argument indicating whether we want optional output   variables returned as well\n\nOutputs\n\nlogl\n: value of the average log likelihood function of the SSM under assumption that   observation noise ϵ(t) is normally distributed\npred\n: a \nNz\n x \nT+lead\n matrix containing one-step predicted state vectors.\nvpred\n: a \nNz\n x \nNz\n x \nT+lead\n matrix containing mean square errors of predicted   state vectors.\nfilt\n: an optional \nNz\n x \nT\n matrix containing filtered state vectors.\nvfilt\n: an optional \nNz\n x \nNz\n x \nT\n matrix containing mean square errors of filtered   state vectors.\n\nNotes\n\nThe state space model is defined as follows:\n\nz(t+1) = a+F*z(t)+η(t)     (state or transition equation)\ny(t) = b+H*z(t)+ϵ(t)       (observation or measurement equation)\n\nWhen z0 and Vz0 are omitted, the initial state vector and its covariance matrix of the time invariant Kalman filters are computed under the stationarity condition:\n\nz0 = (I-F)\nvz0 = (I-kron(F,F))(V(:),Nz,Nz)\n\nwhere F and V are the time invariant transition matrix and the covariance matrix of transition equation noise, and vec(V) is an Nz^2 x 1 column vector that is constructed by stacking the Nz columns of V.  Note that all eigenvalues of F are inside the unit circle when the state space model is stationary.  When the preceding formula cannot be applied, the initial state vector estimate is set to a and its covariance matrix is given by 1E6I.  Optionally, you can specify initial values.\n\n\n\n"
},

{
    "location": "algorithms.html#State-Space-Routines-1",
    "page": "Algorithms",
    "title": "State Space Routines",
    "category": "section",
    "text": "Modules = [DSGE]\nPages   = [\"kalman.jl\"]\nOrder   = [:function, :type]"
},

{
    "location": "contributing.html#",
    "page": "Contributing to DSGE.jl",
    "title": "Contributing to DSGE.jl",
    "category": "page",
    "text": ""
},

{
    "location": "contributing.html#contributing-1",
    "page": "Contributing to DSGE.jl",
    "title": "Contributing to DSGE.jl",
    "category": "section",
    "text": ""
},

{
    "location": "contributing.html#Notes-for-DSGE.jl-Contributors-1",
    "page": "Contributing to DSGE.jl",
    "title": "Notes for DSGE.jl Contributors",
    "category": "section",
    "text": "We are continuing to add more features to this package. Please see the README for details.As these steps are under development, we would welcome improvements to the existing code from the community. Some examples could be: - Performance improvements - Alternatives to algorithms used here (optimization, hessian, etc.) - Other general improvements   - Adding documentation/test coverage   - Adding existing notable DSGE models into the models/ directory"
},

{
    "location": "contributing.html#Git-Recommendations-For-Pull-Requests-1",
    "page": "Contributing to DSGE.jl",
    "title": "Git Recommendations For Pull Requests",
    "category": "section",
    "text": "These are adapted from JuliaLang.Avoid working from the \nmaster\n branch of your fork, creating a new branch    will make it easier if DSGE's \nmaster\n changes and you need to update your    pull request.\nTry to    \nsquash\n    together small commits that make repeated changes to the same section of    code so your pull request is easier to review, and Julia's history won't    have any broken intermediate commits. A reasonable number of separate    well-factored commits is fine, especially for larger changes.\nIf any conflicts arise due to changes in DSGE's \nmaster\n, prefer updating    your pull request branch with \ngit rebase\n versus \ngit merge\n or \ngit pull\n,    since the latter will introduce merge commits that clutter the git history    with noise that makes your changes more difficult to review.\nDescriptive commit messages are good.\nUsing \ngit add -p\n or \ngit add -i\n can be useful to avoid accidentally    committing unrelated changes.\nGitHub does not send notifications when you push a new commit to a pull    request, so please add a comment to the pull request thread to let reviewers    know when you've made changes.\nWhen linking to specific lines of code in discussion of an issue or pull    request, hit the \ny\n key while viewing code on GitHub to reload the page    with a URL that includes the specific version that you're viewing. That way    any lines of code that you refer to will still make sense in the future,    even if the content of the file changes.\nWhitespace can be automatically removed from existing commits with \ngit rebase\n.\nTo remove whitespace for the previous commit, run      \ngit rebase --whitespace=fix HEAD~1\n.\nTo remove whitespace relative to the \nmaster\n branch, run      \ngit rebase --whitespace=fix master\n."
},

{
    "location": "contributing.html#DSGE-Julia-Style-Guide-1",
    "page": "Contributing to DSGE.jl",
    "title": "DSGE Julia Style Guide",
    "category": "section",
    "text": ""
},

{
    "location": "contributing.html#Intro-1",
    "page": "Contributing to DSGE.jl",
    "title": "Intro",
    "category": "section",
    "text": "This document lists Julia coding recommendations consistent with best practices in the software development community. The recommendations are based on guidelines for other languages collected from a number of sources and on personal experience. These guidelines are written with the FRBNY DSGE code in mind. All pull requests submitted should follow these general style guidelines."
},

{
    "location": "contributing.html#Naming-conventions-1",
    "page": "Contributing to DSGE.jl",
    "title": "Naming conventions",
    "category": "section",
    "text": "Emphasize readability! Our goal is for the code to mimic the mathematical notation used in FRBNY DSGE papers as closely as possible.The names of variables should document their meaning or use. Variables with a large scope should have especially meaningful names. Variables with a small scope can have short names.Exhibit consistency with the existing codebase.Modules and type names in UpperCamelCaseVariable names in snake_case.Variable names should be in lower case, using underscores to separate parts of a compound variable name. For example, steady_state and equilibrium_conditions are two fields in the Model990() object that follow this convention. Also notice that, though the words could be shortened, they are spelled out for maximum clarity.The prefix \nn_\n should be used for variables representing the number of objects (e.g. \nn_parameters\n or \nn_anticipated_shocks\n) use the suffix \ns\n as is natural in spoken language.Negative Boolean variable names should be avoided. A problem arises when such a name is used in conjunction with the logical negation operator as this results in a double negative. It is not immediately apparent what \n!isNotFound\n means.  Use \nisFound\n. Avoid \nisNotFound\n.Named constants can be all uppercase using underscore to separate words: \nMAX_ITERATIONSNaming mathematical objectsVariables with mathematical significance should use  unicode characters and imitate LaTeX syntax.  For example, ρ should be used to   name the autocorrelation coefficient in an AR(1) process, and σ should be used to name standard deviation. Parameters in the text should keep the same symbol in the code (e.g. α in the code is the same α as in this paper, and takes on it usual significance as the capital share in a Cobb-Douglas output function.General conventions\nUnderscores can and should be used when the variable refers to a     mathematical object that has a subscript. (In this case, we are     imitating LaTeX syntax.) For example, \nr_m\n in LaTeX should be     represented by the variable \nr_m\n.\nIf the mathematical object has multiple subscripts, for example \nx_ij\n,     simply concatenate the subscripts: \nx_ij\n.\nIf the object has superscripts as well as subscripts, for example     \ny^f_t\n, separate the superscripts with an underscore and place them     first: \ny_f_t\n.\nFor compatibility with existing code, variables with numeric subscripts     should exclude the underscore: \nG0\n, \nψ1\n.\nMatrices that have mathematical significance (e.g. the matrices of the     transition and measurement equations) should be upper case, as they are     in mathematical notation, and can repeat the letter to avoid collisions:     \nTTT\n or \nQQ\n.\nSymbols such as overbars (which indicate mean values) and  tildes (which indicate     log-deviations from the steady state) are written using a 3- or     4-letter abbreviation immediately after the variable they modify:     \nkbar_t\n, \nztil\n (z tilde).\nStars indicating steady-state variables are included as     subscripts: \nπ_star_t\nSuffixes\nTime: Consistent with the previous bullet points, the suffix \n_t\n as in     \nx_t\n signifies the value of \nx\n at time \nt\n. The suffix \n_t1\n     signifies the value of \nx\n at time \nt-1\n.\nShocks: The suffix \n_sh\n refers to a model shock.\nPrefixes\nThe prefix \neq_\n refers to an equilibrium condition.\nThe prefix \nobs_\n refers to an observable.\nThe prefix \nE\n refers to the expectation operator.\nThe prefix \nI\n refers to the indicator operator.\nObservables with the prefix \ng\n refer to growth rates."
},

{
    "location": "contributing.html#Code-Formatting-Guidelines-1",
    "page": "Contributing to DSGE.jl",
    "title": "Code Formatting Guidelines",
    "category": "section",
    "text": "Indent 4 spaces\nWrap lines at 92 characters\nUse whitespace to enhance readability\nNo trailing whitespace"
},

{
    "location": "MatlabToJuliaTransition.html#",
    "page": "MATLAB to Julia Transition: Estimation",
    "title": "MATLAB to Julia Transition: Estimation",
    "category": "page",
    "text": ""
},

{
    "location": "MatlabToJuliaTransition.html#The-DSGE-MATLAB-to-Julia-Transition:-Improvements-and-Challenges-1",
    "page": "MATLAB to Julia Transition: Estimation",
    "title": "The DSGE MATLAB to Julia Transition: Improvements and Challenges",
    "category": "section",
    "text": "Zac Cranko, Pearl Li, Spencer Lyon, Erica Moszkowski, Micah Smith, Pablo Winant  December 3, 2015The FRBNY DSGE model is a relatively large New Keynesian model augmented with financial frictions and a variety of innovations. Here at the Fed, we use it both for forecasting and policy analysis. Research using this model includes looking at the dynamics of inflation during the great recession, the effects of forward guidance, and much more.When we were approached by the folks at QuantEcon about a possible collaboration, we jumped at the idea, as it would give us an opportunity to rework our code in an arguably faster language, redesign it from the ground up, and release it open source for the benefit of the community. A full-fledged package for the FRBNY DSGE model would also provide QuantEcon another opportunity to highlight its contribution to high-performance, quantitative economic modeling. Julia was the language of choice, recommended by the QuantEcon group for its high performance and suitability for this breed of technical computing.In this post, we’ll discuss our experiences redesigning our code from the ground up, the resulting performance changes, and the challenges we faced working with such a young language.  We created a suite to assess the performance of our Julia code, relative to our MATLAB code. We focus on both the core functions used in solving and estimating the model, as well as on longer-running routines of greater scope. These tests were conducted on a single core on an Intel® Xeon® E5-2697 v2 2.70GHz CPU running GNU/Linux:Benchmark times relative to MATLAB (smaller is better)Test MATLAB (14a) Julia (0.4.0)\ngensys 1.00 0.17\nsolve 1.00 0.09\nkalman_filter 1.00 0.75\nposterior 1.00 0.26\ncsminwel 1.00 0.33\nhessian 1.00 0.23\nmetropolis_hastings 1.00 0.11We ultimately achieve an increase of speed that reduces running time to 1/10th to 3/4th that of the MATLAB code. The Metropolis-Hastings sampling step is the most time consuming, and hence the relevant one in terms of assessing speed improvement. On the basis of this step, we conclude that DSGE.jl is approximately ten times faster than the MATLAB code.How much of this increase is due to native performance adventures of Julia, and how much is simply due to the improvements in design that came from rebuilding this project from the ground up? It is of course difficult to say, and it is important to emphasize that one cannot be sure what portion of the performance increase can be attributed to inherent language features as opposed to design differences. Indeed, our MATLAB code suffers from many inefficiencies due to its long, cumulative development, and support for a plethora of models and features. Meanwhile, these design issues have been largely addressed in our Julia package. To best isolate differences in the languages themselves, we can look at our code to compute the model solution with gensys and apply the Kalman filter with kalman_filter. These two functions have relatively little redesign and optimization as compared to the MATLAB code and provide the most comparable, though still imperfect, measurements of performance. The reduction of 1/5th to 3/4th in computing time, therefore, could be taken as a first estimate of Julia's advantage in this single arena of computation."
},

{
    "location": "MatlabToJuliaTransition.html#Code-Improvements-1",
    "page": "MATLAB to Julia Transition: Estimation",
    "title": "Code Improvements",
    "category": "section",
    "text": "Julia provides versatile language features that allow us to improve our code's performance and clarity in several fundamental ways. First and foremost of these is the highly integrated, robust, and flexible type system that lends itself naturally to our DSGE model. At the center of the DSGE.jl package is the model object. Here, one can store all information associated with the model – including the numerous parameters, priors, states, equilibrium conditions, computational settings, and flags – in one place.  By simply passing the model object as an argument to any function, the function has access to all of the model's fields.  By comparison, our MATLAB code stored all variables directly in the global workspace – an approach that scaled poorly as model specifications become more and more complex. To illustrate just how unwieldy our MATLAB code was, many of our function calls required more than 20 positional arguments, a serious challenge for usage and human-readability:[post_new,like_new,zend_new,ZZ_new,DD_new,QQ_new] = ...\n    feval('objfcnmhdsge',para_new,bounds,YY,YY0,nobs,nlags,nvar,mspec,npara,...\n    trspec,pmean,pstdd,pshape,TTT_new,RRR_new,CCC_new,valid_new,para_mask,...\n    coint,cointadd,cointall,YYcoint0,args_nant_antlags{:});While several of these arguments (e.g., coint) relate to a feature not-implemented in Julia, one can still see the excesses of providing so much information about the model separately in function calls.The same code in Julia:post_out = posterior!(m, para_new, data; mh=true)Certainly, one could approximate a \"model object\" in MATLAB by using its own object-oriented classes, or by \"bundling\" model attributes into a struct or other data structure.  However, MATLAB classes are both relatively complicated and slower than non-object implementations. And using structs in this way results in copies of all model variables made on every function call.Indeed, changes like this reduce the number of lines of code in DSGE.jl, a rough proxy for ease of maintenance. We find that the fixed cost of setting up the type system is offset by savings in core programs.Language Lines of code (hundreds)\nMatlab 63\nJulia 37A type-based approach allows us to take advantage of method dispatch in Julia by defining different model types for different model specifications. As detailed in the README file, changes to the model's equilibrium conditions and measurement equation are referred to as changes in a model's \"specification.\"  In the Julia code, model specifications have a 1:1 correspondence with concrete types.  Where necessary, a single function can have multiple methods defined, that are customized for different model types. For example, the augment_states function augments the model's transition matrices after it has been solved.  We can pass any model object m to augment_states, and Julia ensures that the proper, model-specific method is dispatched:TTT, RRR, CCC = augment_states(m, TTT_gensys, RRR_gensys, CCC_gensys)In our MATLAB code, on the other hand, we would approximate this type of dispatch by using a switch statement over a model identifier variable. For the hundreds of models we have worked with in a development capacity, this led to bloat in our model solution code. In Julia, we encapsulate this behavior within the model definition itself.It is easy to see that all model types constructed for use with DSGE.jl are closely related: they will have the same fields, and are passed to the same methods.  If it sounds to you like we have an implicit interface here, you’re right. Rather than implementing each object as a standalone type, we define an abstract type, AbstractModel, to serve as the parent for all model types. Because most of our routines are not model-specific, we need only define them once (with an argument of type AbstractModel) and Julia's dispatch system takes care of the rest. We similarly define model parameters as subtypes of a common abstract type AbstractParameter. This allows us to abstract to one notion of a model parameter, while implementing different kinds of parameters in different ways. We also use parameterized (generic) types to increase the flexibility of model parameters (as well as elsewhere in our codebase):# A parameter contains values of data type `T` and embeds a transformation of\n# type `U`\nabstract Parameter{T,U<:Transform} <: AbstractParameter{T}\n\n# One transformation used is the identity\ntype UnscaledParameter{T,U} <: Parameter{T,U}\n    # ...\nendThese functions expect the model object to have certain fields, and for those fields to have certain types. (As an example of Julia's youthful status as a language, discussion continues, as of this writing, on an appropriate manner to explicitly introduce interfaces.)With a clear interface in place, running new model specifications using DSGE.jl is relatively straightforward. (See here for detailed instructions).Julia's JIT compilation provides significant performance boosts in some areas. For example, we allow a variable number of anticipated monetary policy shocks, beginning in 2008Q4, that we use to treat the zero lower bound. In our MATLAB code, we suffer some dynamic code generation to implement this feature.if exist('nant','var')\n    for i=1:nant\n        eval(strcat('rm_tl',num2str(i),'  = ',num2str(nstates+i)));\n        eval(strcat('rm_tl',num2str(i),'  = ',num2str(nstates+i)));\n    end\nendJulia's faster evaluation of such statements reduces this performance hit, as these symbols can be associated with the model object.[symbol(\"rm_tl$i\") for i = 1:n_anticipated_shocks(m)]\n# ...\n[symbol(\"rm_shl$i\") for i = 1:n_anticipated_shocks(m)]Granted, there may be better solutions to our problem in both languages, but similar situations involving code generation are easily addressed in Julia.We have found that a number of Julia features make working with DSGE.jl simply more pleasant and user-friendly than working with our old codebase. Julia's clearly integrated testing infrastructure has made our development workflow significantly more robust. Unicode support means that code can correspond more closely to actual model equations, reducing the headache associated with translating from \"math\" to \"code\".  (Inline Markdown documentation helps in a similar way.) Operator overloading and user-defined syntax make it easy to be much more expressive with our code.julia> m[:α]                         # Access value of param α from model m\njulia> m <= parameter(:ϵ_p, 10.000)  # Add parameter ϵ_p to model\njulia> Γ0, Γ1, C, Ψ, Π  = eqcond(m)  # Get equilibrium conditionsWe have found that Julia's highly integrated, Git-based package manager is an improvement over MATLAB's decentralized FileExchange. As Julia users, we can now pull in high-quality, fully tested, community-supported external packages that can each be installed or updated with a single command.julia> Pkg.add(\"QuantEcon\")          # That's it!This reduces the need for users to create their own, likely lower-quality functionality, increasing developer and code performance. (Or the need to fight for the toolbox licenses available to their department.)We acknowledge that our package is far from perfect. Possible improvements to DSGE.jl are many and varied. We may experiment with alternative, modern, numerical routines to improve speed. Ultimately, powerful metaprogramming support would allow user to specify model equations more literally, in mathematical notation. We welcome improvements to the existing code from the community."
},

{
    "location": "MatlabToJuliaTransition.html#Challenges-1",
    "page": "MATLAB to Julia Transition: Estimation",
    "title": "Challenges",
    "category": "section",
    "text": "Converting the FRBNY DSGE model from MATLAB, a mature and well-supported language, to an extremely young language like Julia involved no shortage of challenges. Significant changes to the Julia language itself are introduced in rapid succession, and using DSGE.jl with a new Julia version inevitably floods the user’s screen with deprecation warnings. There is significant difficulty in finding written resources on the language beyond the Julia Manual itself. Google searches frequently return discussions in GitHub Issues, which are unhelpful to elementary users and can be actively misleading at times.Differences between the behavior of MATLAB and Julia’s core linear algebra libraries led to many roadblocks in the development of DSGE.jl. Julia uses multithreaded BLAS functions for some linear algebra functions.  Using a different number of threads can change the results of matrix decomposition when the matrix is singular. This indeterminacy caused significant problems for our testing suite, both in comparing output matrices to MATLAB results and in testing for reproducibility among Julia outputs.We ran into similar numerical problems while porting the model solution algorithm, gensys. At one point, the generalized Schur (QZ) decomposition is computed, yielding the decompositions A=QSZ' and B=QTZ'. In MATLAB, upper triangular matrices S and T are returned. In Julia, meanwhile, the default behavior is to return a real decomposition with upper Hessenberg (blocked diagonal) matrices S and T. Differing behaviors like this in the two languages might expose a user without deep knowledge of the procedure to errors.Finally, dealing with a recently introduced language can make it more difficult for new users to produce performant code.  A typical economist, especially one coming from a MATLAB background, may be unfamiliar with the nature and use of language concepts like type stability, parametric types, and preallocation. Julia's profiler and debugger lack the flexibility of those in MATLAB, and can make it difficult to identify the source of errors or performance bottlenecks. And Julia IDEs, like Juno, while admirable, are not as mature or featured as the MATLAB IDE.It is important to note again that similar improvements could have been made to our MATLAB code directly. (As we would be the first ones to admit.) Regardless, the Julia paradigm results in code that is high-quality from the outset."
},

{
    "location": "MatlabToJuliaTransition.html#Conclusion-1",
    "page": "MATLAB to Julia Transition: Estimation",
    "title": "Conclusion",
    "category": "section",
    "text": "After months of hard work, we are pleased to be able to increase the performance of our model and provide our project for the benefit of the community. For those considering similar projects, we find the benefits of a transition to Julia are significant. One should, however, be realistic about the challenges that will be faced transitioning to a young language."
},

{
    "location": "MatlabToJuliaTransition.html#Disclaimer-1",
    "page": "MATLAB to Julia Transition: Estimation",
    "title": "Disclaimer",
    "category": "section",
    "text": "This post reflects the experience of the authors with Julia and MATLAB and does not represent an endorsement by the Federal Reserve Bank of New York or the Federal Reserve System of any particular product or service. The views expressed in this post are those of the authors and do not necessarily reflect the position of the Federal Reserve Bank of New York or the Federal Reserve System. Any errors or omissions are the responsibility of the authors."
},

{
    "location": "julia_forecasting.html#",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "MATLAB to Julia Transition: Forecast",
    "category": "page",
    "text": ""
},

{
    "location": "julia_forecasting.html#Macroeconomic-Forecasting-with-DSGEs-Using-Julia-and-Parallel-Computing-1",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "Macroeconomic Forecasting with DSGEs Using Julia and Parallel Computing",
    "category": "section",
    "text": "Marco Del Negro, Abhi Gupta, Pearl Li, Erica MoszkowskiApril 17, 2017In December 2015, we announced DSGE.jl, our open-source, Julia-language package for working with dynamic stochastic general equilibrium (DSGE) models. At that time, DSGE.jl contained only the code required to specify, solve, and estimate such models using Bayesian methods. Now, we present the additional code needed to produce economic forecasts using estimated DSGE models. This new code replicates our MATLAB codebase while being more efficient, easier to read, and open source.As we noted in our last post and its corresponding technical post, porting our code to Julia presented us with the opportunity to improve both our code's performance and our team's workflow. While the estimation step was largely a direct port, we redesigned the forecast section to obtain code that is faster and easier to use. In this post, we will discuss the performance improvements we have achieved in forecasting the DSGE model, as well as the design principles and Julia tools (particularly related to parallel computing) that helped us achieve those results."
},

{
    "location": "julia_forecasting.html#Performance-Improvements-1",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "Performance Improvements",
    "category": "section",
    "text": "To motivate our decision to redesign the forecasting code, we first present some overall performance comparisons between our MATLAB and Julia codebases. Because the design of the code has changed significantly, these results should not be taken as a horse race between Julia and MATLAB. Rather, they should indicate the extent to which our design decisions, in conjunction with the power of the Julia language, have improved the process of running a DSGE forecast.These tests were conducted on a single core on an Intel® Xeon® E5-2697 v2 2.70GHz CPU running GNU/Linux. The exception is computing all the full-distribution results, which was done using 50 parallel workers.Benchmark Times Relative to MATLAB 2009a (Smaller is Better)Test MATLAB (2014a) Julia (0.4.5)\nSimulation smoothing 1.00 0.38\nForecasting 1.00 0.24\nComputing shock decompositions 1.00 0.12\nFull set of forecast outputs (modal parameters) 1.00 0.10\nFull set of forecast outputs (full distribution of parameters) 1.00* 0.22*Unlike the other steps being tested, the full-distribution forecast timing was run in MATLAB 2009a. Our code relies on MATLAB parallelization features that were deprecated with the introduction of the Parallel Computing Toolbox.Post estimation, we produce a number of forecast-related outputs, either at the mode or using the full estimated posterior distribution. The tasks involved include smoothing, forecasting (both enforcing the zero lower bound and not), and computing shock decompositions (exercises that allow us to account for the evolution of observed variables in terms of their driving forces).With our most recent model, which is available in DSGE.jl, we can compute all the full-distribution forecast outputs in approximately fifteen minutes. In comparison, the same computations in MATLAB typically take about seventy minutes. As a result, we can experiment with different options and correct mistakes much more flexibly than we could previously.In the next sections, we discuss the design principles that guided our port, as well as the Julia parallel programming tools that enabled us to write efficient parallel code."
},

{
    "location": "julia_forecasting.html#Design-Principles-1",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "Design Principles",
    "category": "section",
    "text": "Our goal when porting the forecast step to Julia was to write code that could efficiently produce easy-to-interpret results. Furthermore, because we are often interested in looking at just one kind of result (for instance, impulse response functions), we wanted it to be equally simple to produce a single, very specific output as it was to produce all results. These two goals translated into two related principles that guided our Julia code development: type-orientation and modularity.Type-OrientationAs we discussed in our previous post, Julia's type system allows us to write very clean, well-structured code, and we use types heavily throughout the codebase. For example, in the forecast step, we use types heavily to keep track of the information we need to download and transform our input data. As an example, let's consider the process of downloading and transforming the GDP series for use in the DSGE model. First, using the FredData.jl package, we pull the aggregate nominal GDP series (in dollars) from the Federal Reserve Economic Database (FRED) programmatically. Before the estimation, we transform this series into the appropriate units for the log-linearized model: quarter-to-quarter log differences of real, per-capita GDP. After estimating and forecasting the model, we finally transform the results into the units most frequently discussed by policymakers and researchers: annualized GDP growth in percentage terms.We wanted a simple way to keep track of all of the information associated with the GDP variable in a single place. To do this, we created a new Julia type called an Observable. An instance of the Observable type bundles together the name of the variable, sources used to create the series, and all transformations associated with that series. An instance of this Observable type has the following fields:type Observable\n    key::Symbol\n    input_series::Vector{Symbol}\n    fwd_transform::Function\n    rev_transform::Function\n    name::UTF8String\n    longname::UTF8String\nendThe key, name, and longname fields serve similar but slightly different purposes. The key is used as the primary way we refer to the GDP variable in the code: when we construct the entire dataset, we create a DataFrame (2-dimensional table) and label each series with its key. By contrast, name is a longer-form name that we intend to use to label plots, while longname is more of a description of the series. This information helps us to label variables easily and keep the code clear.The more interesting fields are input_series, fwd_transform, and rev_transform. The input_series field is a vector of Symbols, each of which must be of the form :SERIES__SOURCE. In the case of GDP, this field is the vector [:GDP__FRED, :CNP16OV__FRED, :GDPCTPI__FRED]. All of these series come from FRED, and in particular, we use the nominal GDP, working-age civilian population, and GDP deflator series to construct the real per-capita GDP growth.The fwd_transform and rev_transform fields encode the transformations we make to the GDP series to go from raw data to model units and from model units to output units, respectively. These fields are particularly interesting because they must be populated by objects that are of type Function. That's right—a function is an instance of the Function type! Therefore, a given function is really no different than any other variable in Julia. That means we can define any function we want (abstract, named, with or without keyword arguments) and assign the name of that function to the fwd_transform and rev_transform fields. In the data step of the code, for instance, we can retrieve the name of the function by querying the Observable object and then apply the function to an appropriate set of arguments. This is a very direct method of looking up which transforms to apply, and simultaneously provides the opportunity for us to abstract common transformations into an appropriately named function. Abstraction is a technique for encapsulating low-level functionality or pieces of data into a well-named, reusable function or type. In our case, abstracting transformations into functions is useful because multiple observables can make use of the same commonly used functions.Finally, we can construct the gdp observable as follows:data_series = [:GDP__FRED, :CNP16OV__FRED, :GDPCTPI__FRED]\nfwd_transform = function (levels) ... end    # an anonymous function definition\nrev_transform = loggrowthtopct_annualized_percapita\nobs_gdp = Observable(:obs_gdp, data_series, fwd_transform, rev_transform,\n    \"Real GDP  Growth\", \"Real GDP Growth Per Capita\")We then store obs_gdp in a Dict{Symbol, Observable}, a lookup table that allows us to look up Observable objects, which is in turn stored in the observables field of the model object. We can query the model object for the rev_transform of` gdp_obs` by simply calling m.observables[:gdp_obs].rev_transform (where m is an instance of a model type). Since this information is stored inside the model object for every observable, it is automatically available to every function that accepts a model object—helping us keep our function calls manageable and our data organized.We have found Julia's type system to be a helpful way to abstract the details associated with transforming data to and from various units. Observables are clearly a DSGE.jl-specific example of a user-defined type, but we hope this discussion illustrates how Julia types and effective abstraction can help economists structure and clarify their code.ModularityMost software systems (and economic models, for that matter) are designed to produce a wide variety of outputs. Macroeconomists often want to produce tables of parameters, impulse response functions, and time series plots for different economic variables. Often, users want to choose which of a set of possible outputs to compute. In a DSGE model, it is common to compute smoothed histories and forecasts of observables and unobservable states, shock decompositions (which decompose the path of each economic variable into the shocks responsible for its fluctuations), and impulse response functions. Additionally, users may want to change various settings. In our case, we can choose to forecast using the modal parameters or a selection of draws from the posterior distribution of the parameters. We can decide whether or not to enforce the zero lower bound on nominal interest rates. We can use no data from the current quarter, condition on only financial data from the current quarter, or use both financial data and GDP data from the current quarter. We can choose from several different smoothers to compute smoothed histories of states and observables.Producing and storing all of these results takes both time and disk space. As users of our own old codebase, we found that these costs were often burdensome if we only wanted to produce a single result (for instance, an unconditional shock decomposition for GDP growth). This occurred because the top-level forecast function always called every subroutine, computed every output, and returned all outputs. Redesigning the codebase gave us the opportunity to write code that could produce specific outputs in addition to all outputs.Fundamentally, in the DSGE forecast, there are three pieces of information we need to produce the specific outputs desired by the user. First, does the user want to produce a modal forecast or a full distribution forecast with uncertainty bands? Second, does she want to condition on any data from the current quarter? And third, which kinds of outputs does she want to produce (forecasts, shock decompositions, etc.)?  Once we know the answers to these questions, we can logically determine which outputs need to be produced and which can be ignored. Therefore, we present the user with one top-level function, which takes in these arguments and determines which subroutines need to be run.This modular approach to control flow can be taken in any language, but it is an important component of developing a large software system or economic model and thus we decided it was important to mention. Writing modular, type-oriented, and well-abstracted code improves the robustness of our workflow by making our code and results easier to interpret and less prone to error. In the next section, we'll discuss the main reason our Julia codebase is so fast: we are able to exploit Julia's parallel programming tools."
},

{
    "location": "julia_forecasting.html#Parallel-Computing-1",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "Parallel Computing",
    "category": "section",
    "text": "The types of forecast-related computations we do are naturally suited to parallelization. While our MATLAB code was parallelized to an extent (and was written before the advent of the MATLAB Parallel Computing Toolbox!), we decided to reassess our design when we ported the forecast step to Julia. We considered two approaches: \"parallel maps\" and distributed storage. The first is largely similar to our MATLAB parallelization implementation, while the latter takes advantage of the DistributedArrays.jl package and represents a substantial design shift. Over the course of development, we learned a great deal about writing effective parallelized Julia code and about parallel computing in general. Though the distributed storage approach did not end up improving on the parallel mapping approach, our final Julia code is faster and better designed than the original MATLAB implementation.Like many academic institutions, the FRBNY Research Group maintains a Linux-based cluster for use by the economists and RAs. This setup allows us to distribute computing jobs across multiple processes on multiple compute nodes, so that non-serially dependent jobs can be executed at the same time. However, our jobs must also coexist with those of other researchers, which limits both the amount of CPU time and memory we can use before disrupting other work. Our code is designed to take advantage of the features of and respect the constraints of this environment.During the estimation step, we simulate drawing a large number of parameters (typically 100,000) from their posterior distribution. In the forecast step, these draws are read in and used to compute the desired outputs for our observed variables and the latent states. As discussed before, these outputs can include smoothed shock times series, forecasts, shock decompositions, and impulse response functions. Since these computations are independent for each parameter draw, forecasting using the full distribution lends itself well to parallelization.To reduce our impact on other users of the cluster, we make use of a \"blocking\" scheme in our Julia code. The parameter draws are read in blocks of typically 5,000 draws. These draws are then immediately distributed using Julia's pmap function (\"parallel map\") to worker processes, each of which carries out the entire forecast step for just one draw. When all of the draws from that block have completed, the originator process re-collects the forecast outputs and saves them to disk. This repeats until all blocks have completed. Through this blocking, we can avoid keeping too much data in memory, since we only operate on a fraction of the parameter draws at any given time. However, we can still write structured output files using the HDF5 file format, which allows us to write to specific subsets of pre-allocated arrays, so that the end result is as if we had computed all the draws at once without blocking.Before settling on this version, we also tried using Julia's DistributedArrays.jl package, which distributes large arrays in memory over many processes. This allowed us to hold all of our parameter draws and their corresponding forecast outputs in memory at the same time, and it allowed each process to operate on the parameter draws it held locally without needing to copy data back and forth between processes. However, using distributed arrays also forced us to explicitly handle lower-level tasks like assigning parameter draws to processes. Since each process handled a predetermined set of draws, it was not easy to reallocate draws if some of the compute nodes on which the processes lived happened to be busier than others on a particular day. Switching to pmap allowed us to abstract away from many of these concerns, as it has already been optimized to take advantage of the aforementioned independence of parameter draws."
},

{
    "location": "julia_forecasting.html#StateSpaceRoutines.jl-1",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "StateSpaceRoutines.jl",
    "category": "section",
    "text": "A big benefit of using Julia is the large and growing package ecosystem, which allows all users to access high-quality open-source code. Thanks to this system, Julia developers can focus their development time on the issues and projects they really care about, without having to repeatedly reinvent the wheel. For example, DSGE.jl depends on the DataFrames.jl package to help us manage data and dates. Similarly, DSGE.jl is available for members of the community to modify, extend, and make use of as they see fit. In this spirit, we have decided to break out some DSGE-independent components of DSGE.jl into their own package.DSGE models define a linear system that links observed variables to unobserved states. In order to actually perform inference on these latent states, we apply the Kalman filter and smoothing algorithms. State space models are commonly used across many disciplines, and indeed the routines we use in DSGE.jl can be applied to any sort of linear state space model. As such, we have decided to move the filtering and smoothing routines that we have historically used with the DSGE model into StateSpaceRoutines.jl, a new package that will provide DSGE.jl-independent filtering and smoothing routines.StateSpaceRoutines.jl currently features the one filter and four smoothers we most commonly use in DSGE.jl. On the filtering front, we implement the standard Kalman filter found in James Hamilton's Time Series Analysis StateSpaceRoutines.jl also contains two Kalman smoothers and two simulation smoothers. In addition to the Kalman smoother presented in Time Series Analysis, we also have Jan Koopman's disturbance smoother from his paper Disturbance Smoother for State Space Models. The two simulation smoothers are based on Carter and Kohn's On Gibbs Sampling for State Space Models and Durbin and Koopman's A Simple and Efficient Simulation Smoother for State Space Time Series Analysis. In our experience, the Koopman smoother is faster than the standard Kalman smoother, as it does not require us to calculate the pseudo- inverses of the predicted variance matrices. For the same reason, we have also found that the Durbin and Koopman simulation smoother is faster than the Carter and Kohn one. All of these methods support time-varying matrices and variances. We use this feature to model pre–zero-lower-bound and zero-lower-bound regimes in our DSGE models, but the functionality is general enough to be applied to a wider range of models with regime switching or time varying matrices and variances. We hope that the broader Julia community finds these functions as useful as we have!"
},

{
    "location": "julia_forecasting.html#Disclaimer-1",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "Disclaimer",
    "category": "section",
    "text": "This post reflects the experience of the authors with Julia and MATLAB and does not represent an endorsement by the Federal Reserve Bank of New York or the Federal Reserve System of any particular product or service. The views expressed in this post are those of the authors and do not necessarily reflect the position of the Federal Reserve Bank of New York or the Federal Reserve System. Any errors or omissions are the responsibility of the authors."
},

{
    "location": "julia_forecasting.html#References-1",
    "page": "MATLAB to Julia Transition: Forecast",
    "title": "References",
    "category": "section",
    "text": "Carter, C. and Cohn, R. (1994). On Gibbs Sampling for State Space models. Biometrika.Durbin, K. and Koopman, S. (2002). A Simple and Efficient Smoother for State Space Time Series Analysis. Biometrika.Hamilton, J. (1994). Time Series Analysis. Princeton: Princeton University Press.Koopman, S. (1993). Disturbance Smoother for State Space Models. Biometrika."
},

{
    "location": "license.html#",
    "page": "License",
    "title": "License",
    "category": "page",
    "text": ""
},

{
    "location": "license.html#License-1",
    "page": "License",
    "title": "License",
    "category": "section",
    "text": "Copyright (c) 2015, Federal Reserve Bank of New York All rights reserved.Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
},

]}
