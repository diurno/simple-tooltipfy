const { createHigherOrderComponent } = wp.compose;
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { RangeControl, ColorIndicator, PanelBody, PanelRow, ColorPalette, SelectControl, TextareaControl } from '@wordpress/components';

const colors = [
    { name: 'red', color: '#f00' },
    { name: 'white', color: '#fff' },
    { name: 'blue', color: '#00f' },
];
const positionControlOptions = [
    {
        label: __( 'Top' ),
        value: 'top',
    },
    {
        label: __( 'Bottom' ),
        value: 'bottom',
    },
    {
        label: __( 'Top left' ),
        value: 'top-left',
    },
    {
        label: __( 'Top Right' ),
        value: 'top-right',
    },
    {
        label: __( 'Bottom Left' ),
        value: 'bottom-left',
    },
    {
        label: __( 'Bottom Right' ),
        value: 'bottom-right',
    }
];

const enableSpacingControlOnBlocks = [
    'federico-cadierno/simple-tooltipfy',
];

const addSpacingControlAttribute = ( settings, name ) => {
    // Do nothing if it's another block than our defined ones.
    if ( ! enableSpacingControlOnBlocks.includes( name ) ) {
        return settings;
    }

    // Use Lodash's assign to gracefully handle if attributes are undefined
    settings.attributes = Object.assign( settings.attributes, {
        toolTipPosition: {
            type: 'string',
            default: positionControlOptions[ 0 ].value,
        },
        toolTipText: {
            type: 'string',
        },
        toolTipColor: {
            type: 'string',
        },
        toolTipFontColor: {
            type: 'string',
        },
        toolTipOpacity: {
            type: 'number',
            default: 0.5
        },
        // ATTRIBUTE ADDED TO AVOID VISIBILITY ERROR WHEN LIFTERLMS PLUGIN
        // ITS ALREADY INSTALLED
        llms_visibility: {
            type: 'string',
            default: 'all'
        }
    } );

    return settings;
};

addFilter( 'blocks.registerBlockType', 'simple-beauty-tooltip/attribute/spacing', addSpacingControlAttribute );


/**
* Create HOC to add spacing control to inspector controls of block.
*/
const withSpacingControl = createHigherOrderComponent( ( BlockEdit ) => {
    return ( props ) => {
        // Do nothing if it's another block than our defined ones.
        
        if ( ! enableSpacingControlOnBlocks.includes( props.name ) ) {
            return (
                <BlockEdit { ...props } />
            );
        }

        
        
        // check later if realy need this code below
        /*const position = props.attributes.toolTipPosition;
    
        if ( position ) {
            props.attributes.toolTipPosition = position;
        }

        const text = props.attributes.toolTipText;

        if ( text ) {
            props.attributes.toolTipText = text;
        }

        const tColor = props.attributes.toolTipColor;

        // if ( tColor ) {
        //     props.attributes.toolTipColor = tColor;
        // }
        */

        return (
            <Fragment>
                
                <InspectorControls>
                    <PanelBody
                        title={ __( 'ToolTip Settings' ) }
                        initialOpen={ true }
                    >
                        <SelectControl
                            label={ __( 'ToolTip Position' ) }
                            value={ props.attributes.toolTipPosition }
                            options={ positionControlOptions }
                            onChange={ ( selectedPositionOption ) => {
                                props.setAttributes( {
                                    toolTipPosition: selectedPositionOption,
                                } );
                            } }
                        />

                        <PanelRow>
                            <TextareaControl
                                label="Tool Tip Text"
                                help="Enter tooltip text"
                                value={ props.attributes.toolTipText }
                                onChange={ ( thetext ) => {
                                    props.setAttributes( {
                                        toolTipText: thetext,
                                    } );
                                } }
                            />
                        </PanelRow>
                    </PanelBody>                              
                    <PanelBody
                        title={ __( 'ToolTip Colors' ) }
                        initialOpen={ true }
                    >    
                        <PanelRow>
                            <label>Backgroung Color</label>
                            <ColorIndicator colorValue= { props.attributes.toolTipColor } />
                        </PanelRow>
                        <PanelRow>
                            <ColorPalette
                                colors={ colors }
                                value={ props.attributes.toolTipColor }
                                onChange={ ( color ) => {
                                    props.setAttributes( {
                                        toolTipColor: color,
                                    } );
                                } }
                            />
                        </PanelRow>
                        <PanelRow>
                            <RangeControl
                                label="ToolTip Opacity"
                                initialPosition={ ( props.attributes.toolTipOpacity * 100) }
                                value={ ( props.attributes.toolTipOpacity * 100) }
                                onChange={ ( opacity ) => {
                                    props.setAttributes( {
                                        toolTipOpacity: (opacity > 0 ) ? ( opacity / 100 ) : 0 ,
                                    } );
                                } }
                                min={0}
                                max={100}
                                step={5}
                            />
                        </PanelRow>

                        <PanelRow>
                            <label>Font Color</label>
                            <ColorIndicator colorValue= { props.attributes.toolTipFontColor } />
                        </PanelRow>
                        <PanelRow>
                            <ColorPalette
                                colors={ colors }
                                value={ props.attributes.toolTipFontColor }
                                onChange={ ( color ) => {
                                    props.setAttributes( {
                                        toolTipFontColor: color,
                                    } );
                                } }
                            />
                        </PanelRow>
                    </PanelBody>
                </InspectorControls>
                <BlockEdit { ...props } />
            </Fragment>
        );
    };
}, 'withSpacingControl' );

addFilter( 'editor.BlockEdit', 'simple-beauty-tooltip/with-spacing-control', withSpacingControl );

const addDataAttributes = ( extraProps, blockType, attributes ) => {

    if(blockType.name !== 'federico-cadierno/simple-tooltipfy') {
        return extraProps;
    }

    // ADD EXTRA ATTRIBUTES TO THE PARAGRAPH ELEMENT
    extraProps['aria-label'] = attributes.toolTipText;
    extraProps['data-microtip-position'] = attributes.toolTipPosition;
    extraProps['role'] = 'tooltip';
    extraProps['tooltip-color'] = attributes.toolTipColor;
    extraProps['style'] = `--tooltip-color:${ attributes.toolTipColor};--tooltipfont-color:${ attributes.toolTipFontColor};--tooltip-opacity:${ attributes.toolTipOpacity}`;
    
    return extraProps;
}

addFilter('blocks.getSaveContent.extraProps', 'simple-beauty-tooltip/applyDataAttr', addDataAttributes);

