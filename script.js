$(function() {

    //GLOBAL VARIABLES

    const colors = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD',
    };

    let currOffset, maxOffset, limitOffset, maxOffsetTopScrollLimit;

    //API FUNCTIONS

    function grabListOfPokemon() {

        adjustOffset();

        $.ajax({
            'url': `https://pokeapi.co/api/v2/pokemon?offset=${currOffset}&limit=${limitOffset}`,
            'type': 'get',
            'dataType': 'json'
        }).done(function(data) {

            // data['results'].forEach(pokemon => {
            //     appendPokemon(pokemon['url']);
            // });

            for(const pokemon of data['results']) {
                appendPokemon(pokemon['url']);
                // await new Promise( resolve => setTimeout(resolve, 500));
            }

        }).fail(function() {
            console.log('Fetch failed');
        })

        incrementCurrOffset();
    }

    function appendPokemon(url) {
        $.getJSON(url, function(data) {

            let id = data['id'];

            $('.pokemon-boxes-container').append(
                `
                    <div class='pokemon-box' id=${id}>
                        <div class='pokemon-name'>${capitalize(data['name'])}</div>
                        <div class='pokemon-id'>#${id}</div>
                        <img class='pokemon-image' src='${data['sprites']['front_default']}'>
                        <div class='types'></div>
                    </div>
                `
            )

            let currPokeTypes = addTypes(id, data['types']);

            adjustBkgrdClr(id, currPokeTypes);
           
        }).fail(function() {
            console.log('Append Failed');
        })
    }

    function addTypes(id, pokeTypes) {
        let typeStr = []

        for(let i=0; i < pokeTypes.length; i++) {
            let currType = pokeTypes[i]['type']['name'];

            $(`#${id} .types`).append( `<div class='type'>${capitalize(currType)}</div>` );

            typeStr.push(currType);
        }
        
        return typeStr;
    }

    function adjustBkgrdClr(id, types) {
        $(`#${id}`).css({
            'background-image': `linear-gradient(to top left, ${(types.length > 1 ? colors[types[1]] : colors[types[0]])} 50%, ${colors[types[0]]} 50%)`,
        })
    }

    //NON-API FUNCTIONS

    function capitalize(str) {
        return str[0].toUpperCase() + str.substr(1);
    }


    function changeHeading(id) {
        if (id.slice(0, 3) === 'all' ) {
            $('.generation-heading').text('All Pokemon');
        }
        else {
            $('.generation-heading').text('Generation ' + capitalize(id.slice(4)));

            $('.generation-head-wrapper').css({
                'border-image': `linear-gradient(to right, snow 15%, ${$(`#${id}`).css('background-color')} 80%, snow 20%) 1`,
            })
        }
    }

    function setOffsets(id) {
        if (id == 'all-pokemon') {
            currOffset = 0;
            maxOffset = 898;
        }
        else if (id == 'gen-one') {
            currOffset = 0;
            maxOffset = 151;
        }
        else if (id == 'gen-two') {
            currOffset = 151;
            maxOffset = 251;
        }
        else if (id == 'gen-three') {
            currOffset = 251;
            maxOffset = 386;
        }
        else if (id == 'gen-four') {
            currOffset = 386;
            maxOffset = 493;
        }
        else if (id == 'gen-five') {
            currOffset = 493;
            maxOffset = 649;
        }
        else if (id == 'gen-six') {
            currOffset = 649;
            maxOffset = 721;
        }
        else if (id == 'gen-seven') {
            currOffset = 721;
            maxOffset = 809;
        }
        else if (id == 'gen-eight') {
            currOffset = 809;
            maxOffset = 898;
        }

        limitOffset = 20;
    }

    function adjustOffset() {
        if ( currOffset + limitOffset >= maxOffset )
            limitOffset = maxOffset - currOffset;
    }

    function limitHasBeenReached() {
        if (currOffset >= maxOffset)
            return true;

        return false;
    }

    function incrementCurrOffset() {
        currOffset += limitOffset;
    }

    function reset(container) {
        $(container).empty();
    }

    function updateTopScrollLimit() {
        maxOffsetTopScrollLimit = $('.pokemon-boxes-container')[0].scrollHeight - $('.pokemon-boxes-container').outerHeight();
    }

    function hideScroll(selector) {
        $(`${selector}`).css({'overflow': 'hidden'});
    }

    function unhideScroll(selector) {
        $(`${selector}`).css({'overflow': 'auto'});
    }


    //EVENTS

    $('.gen-button').click(function() {
        changeHeading(this.id);
        setOffsets(this.id);
        grabListOfPokemon(this.id);
        hideScroll('body');
        $('.pop-up-generation-container').slideDown('slow', function() {
            updateTopScrollLimit();
        });
    })

    $('#close-pop-up-gen-button').click(function() {
        $('.pop-up-generation-container').slideUp('slow', function() {
            unhideScroll('body');
            reset('.pokemon-boxes-container');
        });
    })

    $('.pokemon-boxes-container').scroll(function() {
        updateTopScrollLimit();

        if ($(this).scrollTop() >= ( 0.99 * maxOffsetTopScrollLimit ) && !limitHasBeenReached()) {
            grabListOfPokemon();
            $(this).scrollTop( (0.99 * maxOffsetTopScrollLimit) - 200 );
        }
    })

    $('.search-box').keyup(function(key) {
        if (key.keyCode === 13 ) {
            $()
            let pokeName = this.value.toLowerCase();
            $.getJSON(`https://pokeapi.co/api/v2/pokemon/${pokeName }`, function(pokedata) {
                changeInnerPokeName(pokedata['id'], pokeName);
                appendPokemonStats(pokedata['id']);
                $('.inner-pokemon-container').slideDown();
            })
            .fail(function() {
                alert('No such pokemon exists.');
            })

            this.blur();
        }

        
    })

    $(window).resize(function() {
        updateTopScrollLimit();
    })



    //INNER POKE/API FUNCTIONS/EVENTS
    function changeInnerPokeName(id, name) {
        if (name === '.pokemon-name')
            $('.inner-pokemon-name').text(capitalize($(`#${id} ${name}`).text()));
        else
            $('.inner-pokemon-name').text(capitalize(`${name}`));
        
        $('.inner-pokemon-head-wrapper').css({
            'border-image': `linear-gradient(to right, azure 15%, black 80%, azure 20%) 1`,
        })
    }

    function appendPokemonStats(id) {

        let url = `https://pokeapi.co/api/v2/pokemon/${id}`;

        $.getJSON(url, function(stats) {
            $('.pokemon-information-container').append(
                `
                    <div class='sprites'></div>
                    <div class="moves">
                        <table class='move-table'>
                            <thead class='move-table-header'>
                                <th class='table-level-learned-header move-table-head-element'>Level</th>
                                <th class='table-learned-method-header move-table-head-element'>Method</th>
                                <th class='table-move-name-header move-table-head-element'>Move</th>
                                <th class='table-move-type-header move-table-head-element'>Type</th>
                                <th class='table-move-power-header move-table-head-element'>Power</th>
                                <th class='table-move-accuracy-header move-table-head-element'>Accuracy</th>
                                <th class='table-move-pp-header move-table-head-element'>PP</th>
                            </thead>

                            <tbody class='move-table-body'>

                            </tbody>
                        </table>
                    </div>
                `
            )

            $('.moves').css({'background-image': `${ $(`#${id}`).css('background-image')}`})

            $('.sprites').append(`<img class='front-back-sprite' src='${stats['sprites']['front_default']}'>`);

            if (stats['sprites']['back_default'] != null)
                $('.sprites').append(`<img class='front-back-sprite' src='${stats['sprites']['back_default']}'>`);
            
            stats['moves'].forEach(moveIndex => {

                $.getJSON(moveIndex['move']['url'], function(moveInfo) {
                    $('.move-table-body').append(
                        `
                            <tr class="move-container">
                                <td class='level-learned'>
                                    ${moveIndex['version_group_details'].slice(-1)[0]['level_learned_at'] === 0 ? '🚫' : moveIndex['version_group_details'].slice(-1)[0]['level_learned_at']}
                                </td>

                                <td class='learned-method'>
                                    ${moveIndex['version_group_details'].slice(-1)[0]['move_learn_method']['name']}
                                </td>
    
                                <td class='move-name'>
                                    ${capitalize(moveIndex['move']['name'])}
                                </td>
    
    
                                <td class='move-type'>
                                    ${moveInfo['type']['name']}
                                </td>
    
                                <td class='move-power'>
                                    ${moveInfo['power'] === null ? '🚫' : moveInfo['power']}
                                </td>
    
                                <td class='move-accuracy'>
                                    ${moveInfo['accuracy'] === null ? '🚫' : moveInfo['accuracy']}
                                </td>
    
                                <td class='move-pp'>
                                    ${moveInfo['pp']}
                                </td>
    
                            </tr>
                        
                        
                        `
                    )
                })
            })
        })
    }

    $('.pokemon-boxes-container').on('click', '.pokemon-box', function() {
        changeInnerPokeName(this.id, '.pokemon-name');
        appendPokemonStats(this.id);
        $('.inner-pokemon-container').slideDown('slow');
    })

    $('#inner-pop-up-close-button').click(function() {
        $('.inner-pokemon-container').slideUp('slow', function() {
            reset('.pokemon-information-container');
        });
    })

    

    

})
