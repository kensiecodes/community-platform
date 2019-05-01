import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { Form, Field } from 'react-final-form'
import { FieldArray } from 'react-final-form-arrays'
import arrayMutators from 'final-form-arrays'
import { IHowto, IHowtoFormInput } from 'src/models/howto.models'
import { afs } from 'src/utils/firebase'
import TEMPLATE from './TutorialTemplate'
import { IFirebaseUploadInfo } from 'src/components/FirebaseFileUploader/FirebaseFileUploader'
import { stripSpecialCharacters } from 'src/utils/helpers'
import { UploadedFile } from 'src/pages/common/UploadedFile/UploadedFile'
import { InputField, TextAreaField } from 'src/components/Form/Fields'
import { SelectField } from 'src/components/Form/Select.field'
import { Step } from './Step/Step'
import { Button } from 'src/components/Button'
import { FieldState } from 'final-form'
import { HowtoStore } from 'src/stores/Howto/howto.store'
import Heading from 'src/components/Heading'
import { FlexContainer } from 'src/components/Layout/FlexContainer'
import { BoxContainer } from 'src/components/Layout/BoxContainer'
import { TagsSelectField } from 'src/components/Form/TagsSelect.field'
import { ImageInputField } from 'src/components/Form/ImageInput.field'
import { FileInputField } from 'src/components/Form/FileInput.field'
import posed, { PoseGroup } from 'react-pose'

export interface IState {
  formValues: IHowtoFormInput
  formSaved: boolean
  _docID: string
  _uploadPath: string
  _toDocsList: boolean
}

const AnimationContainer = posed.div({
  enter: { x: 0, opacity: 1, delay: 300 },
  exit: { x: 200, opacity: 0, delay: 200 },
})
const required = (value: any) => (value ? undefined : 'Required')

export class CreateHowto extends React.PureComponent<
  RouteComponentProps<any>,
  IState
> {
  uploadRefs: { [key: string]: UploadedFile | null } = {}
  store = new HowtoStore()
  constructor(props: any) {
    super(props)
    // generate unique id for db and storage references and assign to state
    const databaseRef = afs.collection('documentation').doc()
    const docID = databaseRef.id
    this.state = {
      formValues: { ...TEMPLATE.INITIAL_VALUES, id: docID } as IHowtoFormInput,
      formSaved: false,
      _docID: docID,
      _uploadPath: `uploads/documentation/${docID}`,
      _toDocsList: false,
    }
  }

  public initialiseValues() {}

  public onSubmit = async (formValues: IHowtoFormInput) => {
    const inputValues = formValues as IHowtoFormInput
    if (!inputValues.cover_image) {
      alert('Please provide a cover image before saving your tutorial')
    } else {
      const timestamp = new Date()
      const slug = stripSpecialCharacters(formValues.tutorial_title)
      // convert data to correct types and populate metadata
      const values: IHowto = {
        ...formValues,
        slug,
        tutorial_cost: Number(formValues.tutorial_cost),
        cover_image: formValues.cover_image as IFirebaseUploadInfo,
        _created: timestamp,
        _modified: timestamp,
      }
      try {
        await afs
          .collection('documentation')
          .doc(formValues.id)
          .set(values)
        this.setState({ formSaved: true })
        this.props.history.push('/how-to/' + slug)
      } catch (error) {
        console.log('error while saving the tutorial')
      }
    }
  }

  public validateTitle = async (value: any, meta?: FieldState) => {
    if (meta && (!meta.dirty && meta.valid)) {
      return undefined
    }
    if (value) {
      const error = this.store.isSlugUnique(stripSpecialCharacters(value))
      return error
    } else if ((meta && (meta.touched || meta.visited)) || value === '') {
      return 'A title for your how-to is required'
    }
    return undefined
  }

  public validate = async (formValues: IHowtoFormInput) => {
    // TODO: validate cover image exists
    // if (this.state.formValues.cover_image_url === '') {
    // alert('Please provide a cover image before saving your tutorial')
    return Promise.resolve({})
  }

  public render() {
    const { formValues } = this.state
    console.log('formvalues', formValues)
    return (
      <>
        <Form
          onSubmit={v => this.onSubmit(v as IHowtoFormInput)}
          initialValues={formValues}
          validate={() => this.validate}
          validateOnBlur
          mutators={{
            ...arrayMutators,
            clearCoverImage: (args, state, utils) => {
              utils.changeValue(state, 'cover_image', () => null)
            },
          }}
          render={({
            handleSubmit,
            mutators,
            submitting,
            values,
            form,
            invalid,
          }) => {
            const v = values as IHowto
            const disabled = invalid || submitting
            return (
              <form onSubmit={handleSubmit}>
                {/* How To Info */}
                <BoxContainer bg="white" mb={3}>
                  <Heading medium>Create your How-To</Heading>
                  <FlexContainer p={0} flexWrap="wrap">
                    {/* Left Side */}
                    <FlexContainer p={0} pr={2} flex={1} flexDirection="column">
                      <Field
                        name="tutorial_title"
                        validateFields={[]}
                        validate={value => this.validateTitle(value)}
                        component={InputField}
                        placeholder="Title of your How-to *"
                      />
                      <Field
                        name="tags"
                        validateFields={[]}
                        component={TagsSelectField}
                      />
                      <FlexContainer p={0}>
                        <Field
                          name="tutorial_time"
                          validate={required}
                          validateFields={[]}
                          options={TEMPLATE.TIME_OPTIONS}
                          component={SelectField}
                          placeholder="How much time? *"
                          style={{ marginRight: '4px' }}
                        />
                        <Field
                          name="difficulty_level"
                          component={SelectField}
                          options={TEMPLATE.DIFFICULTY_OPTIONS}
                          validateFields={[]}
                          placeholder="How hard is it? *"
                          style={{ marginLeft: '4px' }}
                        />
                      </FlexContainer>
                      <Field
                        name="tutorial_description"
                        validate={required}
                        validateFields={[]}
                        component={TextAreaField}
                        style={{ resize: 'none', flex: 1, minHeight: '150px' }}
                        placeholder="Introduction to your How-To, keep it to 100 words please! *"
                      />
                    </FlexContainer>
                    {/* Right side */}
                    <BoxContainer p={0} width={[1, null, '380px']}>
                      <Field
                        name="cover_image"
                        validateFields={[]}
                        component={ImageInputField}
                        text="Cover Image"
                      />
                      <Field name="tutorial_files" component={FileInputField} />
                    </BoxContainer>
                  </FlexContainer>
                </BoxContainer>

                {/* Steps Info */}
                <FieldArray name="steps">
                  {({ fields }) => (
                    <>
                      <PoseGroup>
                        {fields.map((name, index: number) => (
                          <AnimationContainer
                            key={fields.value[index]._animationKey}
                          >
                            <Step
                              key={fields.value[index]._animationKey}
                              step={name}
                              index={index}
                              onDelete={(fieldIndex: number) => {
                                fields.remove(fieldIndex)
                              }}
                              values={values}
                              _uploadPath={this.state._uploadPath}
                            />
                          </AnimationContainer>
                        ))}
                      </PoseGroup>

                      <Button
                        icon={'add'}
                        width={300}
                        mx="auto"
                        my={20}
                        variant="dark"
                        bg="yellow"
                        onClick={() => {
                          console.log('adding step', values)
                          fields.push({
                            title: '',
                            text: '',
                            images: [],
                            // HACK - need unique key, this is a rough method to generate form random numbers
                            _animationKey: `unique${Math.random()
                              .toString(36)
                              .substring(7)}`,
                          })
                        }}
                      >
                        add step
                      </Button>
                    </>
                  )}
                </FieldArray>
                <Button
                  type="submit"
                  width={1}
                  icon="check"
                  mx="auto"
                  variant={disabled ? 'disabled' : 'secondary'}
                  disabled={submitting || invalid}
                >
                  Publish
                </Button>
              </form>
            )
          }}
        />
      </>
    )
  }
}
