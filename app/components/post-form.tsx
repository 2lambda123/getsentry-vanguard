import { useRef, useState } from "react";
import { Form } from "@remix-run/react";

import type { Category } from "../models/category.server";
import Editor from "./editor";
import useLocalStorage from "~/lib/useLocalStorage";
import styled from "styled-components";
import Button from "./button";
import ButtonGroup from "./button-group";
import ButtonDropdown, { ButtonDropdownItem } from "./button-dropdown";
import FormActions from "./form-actions";
import { categoryTagStyles } from "./category-tag";

export type PostFormErrors = {
  title?: string;
  content?: string;
  categoryId?: string;
  meta?: { [name: string]: string };
};

export type PostFormInitialData = {
  title?: string;
  content?: string;
  categoryId?: string;
  published?: boolean;
  announce?: boolean;
  meta?: { [name: string]: string };
};

const HelpText = styled.div`
  font-size: 0.7em;
  color: #999;
`;

const CategoryOptionLabel = styled.label`
  font-family: "IBM Flex Mono", monospace;
  display: inline-flex;
  flex-direction: row;
  font-size: 0.9em;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1.2rem;
  border-radius: 3rem;
  text-transform: uppercase;
  border: 1px solid #ccc;
  cursor: pointer;
  margin: 0;

  ${(props) => props.active && categoryTagStyles({ colorHex: props.colorHex })};
`;

export const CategoryOptionWrapper = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const CategorySelector = ({
  name,
  categoryList,
  defaultValue = "",
  error,
  onChange,
}: {
  name: string;
  categoryList: Category[];
  defaultValue?: string | null;
  error?: string;
  onChange: (e: any, value: string) => void;
}) => {
  const [categoryId, setCategoryId] = useState(defaultValue);

  return (
    <>
      <CategoryOptionWrapper>
        {categoryList.map((category) => (
          <CategoryOptionLabel
            key={category.id}
            colorHex={category.colorHex}
            active={category.id === categoryId}
          >
            <input
              type="radio"
              name={name}
              value={category.id}
              checked={category.id === categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                onChange(e, e.target.value);
              }}
            />
            {category.name}
          </CategoryOptionLabel>
        ))}
      </CategoryOptionWrapper>
    </>
  );
};

const MetaConfigField = ({
  name,
  required,
  description,
  defaultValue,
  error,
}: {
  name: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
  error?: string;
}) => {
  return (
    <div>
      <label className={required ? "field-required" : ""}>
        <span>{name}: </span>
        <input
          name={`meta[${name}]`}
          required={required}
          defaultValue={defaultValue}
        />
        {description && <HelpText>{description}</HelpText>}
      </label>
      {error && (
        <div className="pt-1 text-red-700" id="content-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default function PostForm({
  categoryList,
  errors,
  initialData,
  canDelete = false,
  canUnpublish = false,
  canAnnounce = true,
}: {
  categoryList: Category[];
  errors?: PostFormErrors;
  initialData?: PostFormInitialData;
  canDelete?: boolean;
  canUnpublish?: boolean;
  canAnnounce?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [storedDraft, setStoredDraft] = useLocalStorage("draft", {});

  if (!initialData) {
    initialData = storedDraft;
  }

  const [categoryId, setCategoryId] = useState<string | null>(
    initialData?.categoryId || categoryList.find(() => true)?.id || null
  );

  const selectedCategory = categoryList.find((c) => c.id === categoryId);

  initialData.announce = !initialData?.published;

  return (
    <Form
      method="post"
      ref={formRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
      className="p-4"
      onSubmit={() => {
        setStoredDraft({});
      }}
      onChange={(e) => {
        const match = e.target.name.match(/^meta\[(.+)\]$/);
        const value = e.target.value;
        const additions = match
          ? { meta: { ...(storedDraft.meta || {}), [match[1]]: value } }
          : { [e.target.name]: value };
        setStoredDraft({ ...storedDraft, ...additions });
      }}
    >
      <div>
        <label className="field-required">
          <span>Title:</span>
          <input
            name="title"
            required
            placeholder="Title"
            autoFocus
            defaultValue={initialData?.title}
            aria-invalid={errors?.title ? true : undefined}
            aria-errormessage={errors?.title ? "title-error" : undefined}
          />
        </label>
        {errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {errors.title}
          </div>
        )}
      </div>
      <div>
        <label className="field-required">
          <span>Category:</span>
          <CategorySelector
            name="categoryId"
            categoryList={categoryList}
            defaultValue={categoryId}
            error={errors?.categoryId}
            onChange={(e, value) => {
              setCategoryId(value);
            }}
          />
        </label>
        {errors?.categoryId && (
          <div className="pt-1 text-red-700" id="categoryId-error">
            {errors.categoryId}
          </div>
        )}
      </div>
      {selectedCategory?.metaConfig.map((meta) => (
        <MetaConfigField
          key={meta.id}
          required={meta.required}
          name={meta.name}
          defaultValue={initialData?.meta?.[meta.name]}
          description={meta.description}
          error={errors?.meta?.[meta.name]}
        />
      ))}
      <div>
        <label className="field-required">
          <span>Content:</span>
          <Editor defaultValue={initialData?.content} />
        </label>
        {errors?.content && (
          <div className="pt-1 text-red-700" id="content-error">
            {errors.content}
          </div>
        )}
      </div>
      <FormActions>
        <ButtonGroup>
          {initialData && initialData.published ? (
            canUnpublish && initialData.published ? (
              <ButtonDropdown type="submit" mode="primary" label="Save">
                <ButtonDropdownItem
                  type="submit"
                  name="published"
                  value="false"
                >
                  Save as Draft
                  <HelpText>Unpublish this post.</HelpText>
                </ButtonDropdownItem>
                <ButtonDropdownItem type="submit" name="published" value="true">
                  Save as Published
                  <HelpText>Just save changes.</HelpText>
                </ButtonDropdownItem>
              </ButtonDropdown>
            ) : (
              <Button type="submit" mode="primary">
                Save
              </Button>
            )
          ) : canAnnounce ? (
            <>
              <ButtonDropdown
                type="submit"
                mode="primary"
                name="published"
                value="announce"
                label="Publish"
              >
                <ButtonDropdownItem
                  type="submit"
                  name="published"
                  value="announce"
                >
                  Publish
                </ButtonDropdownItem>
                <ButtonDropdownItem type="submit" name="published" value="true">
                  Publish Silently
                  <HelpText>Don't send announcements (if configured).</HelpText>
                </ButtonDropdownItem>
              </ButtonDropdown>
              <Button type="submit">Save Draft</Button>
            </>
          ) : (
            <Button type="submit" name="published" value="true">
              Publish
            </Button>
          )}
          {canDelete && (
            <Button type="submit" name="deleted" value="true" mode="danger">
              Delete
            </Button>
          )}
        </ButtonGroup>
      </FormActions>
    </Form>
  );
}
